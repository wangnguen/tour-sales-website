const moment = require('moment');

const Order = require('../../models/order.model');
const City = require('../../models/city.model');

const variableConfig = require('../../configs/variable');

const list = async (req, res) => {
  const find = {
    deleted: false
  };

  // Loc theo trang thai
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Het loc theo trang thai

  // Loc theo ngay tao
  const dataFilter = {};

  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf('date').toDate();
    dataFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf('date').toDate();
    dataFilter.$lte = endDate;
  }
  if (Object.keys(dataFilter).length > 0) {
    find.createdAt = dataFilter;
  }
  // Het loc theo ngay tao

  // Loc theo phuong thuc thanh toan
  const paymentMethod = variableConfig.paymentMethod;
  if (req.query.paymentMethod) {
    find.paymentMethod = req.query.paymentMethod;
  }
  // Het loc theo phuong thuc thanh toan

  // Loc theo trang thai thanh toan
  const paymentStatus = variableConfig.paymentStatus;
  if (req.query.paymentStatus) {
    find.paymentStatus = req.query.paymentStatus;
  }
  // Het loc theo trang thai thanh toan

  // Tim kiem
  if (req.query.keyword) {
    const keywordRegex = new RegExp(req.query.keyword, 'i');
    console.log(keywordRegex);
    find.orderCode = keywordRegex;
  }
  // Het tim kiem

  // Phân trang
  const limitItems = 5;
  const totalRecord = await Order.countDocuments(find);
  const totalPage = Math.max(Math.ceil(totalRecord / limitItems), 1);

  const page = Math.min(Math.max(parseInt(req.query.page) || 1, 1), totalPage);

  const skip = (page - 1) * limitItems;

  const pagination = { skip, totalRecord, totalPage };

  // Hết Phân trang

  const orderList = await Order.find(find)
    .sort({
      createdAt: 'desc'
    })
    .skip(pagination.skip)
    .limit(limitItems);

  for (const orderDetail of orderList) {
    orderDetail.paymentMethodName = variableConfig.paymentMethod.find(
      (item) => item.value === orderDetail.paymentMethod
    ).label;

    orderDetail.paymentStatusName = variableConfig.paymentStatus.find(
      (item) => item.value === orderDetail.paymentStatus
    ).label;

    orderDetail.statusName = variableConfig.orderStatus.find((item) => item.value === orderDetail.status).label;

    orderDetail.createdAtTime = moment(orderDetail.createdAt).format('HH:mm');
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format('DD/MM/YYYY');
  }

  res.render('admin/pages/order_list', {
    titlePage: 'Quản lý đơn hàng',
    orderList,
    paymentMethod,
    paymentStatus,
    pagination
  });
};

const edit = async (req, res) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false
    });

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format('YYYY-MM-DDTHH:mm');

    for (const item of orderDetail.items) {
      const city = await City.findOne({
        _id: item.locationFrom
      });
      item.locationFromName = city.name;
      item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');
    }

    res.render('admin/pages/order_edit', {
      titlePage: `Đơn hàng: ${orderDetail.orderCode}`,
      orderDetail,
      paymentMethod: variableConfig.paymentMethod,
      paymentStatus: variableConfig.paymentStatus,
      orderStatus: variableConfig.orderStatus
    });
  } catch (error) {
    res.redirect('/${pathAdmin}/order/list');
  }
};

const editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({
      _id: id,
      deleted: false
    });

    if (!order) {
      res.json({
        code: 'error',
        message: 'Thông tin đơn hàng không hợp lệ !'
      });
      return;
    }

    await Order.updateOne(
      {
        _id: id,
        deleted: false
      },
      req.body
    );
    req.flash('success', 'Cập nhật đơn hàng thành công !');

    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Thông tin đơn hàng không hợp lệ !'
    });
  }
};

const deletePatch = async (req, res) => {
  if (!req.permissions.includes('order-delete')) {
    res.status(403).json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }
  try {
    const id = req.params.id;
    await Order.updateOne(
      {
        _id: id
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now()
      }
    );
    req.flash('success', 'Xoá danh mục thành công !');
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không hợp lệ !'
    });
  }
};

module.exports = {
  list,
  edit,
  editPatch,
  deletePatch
};
