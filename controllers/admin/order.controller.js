const moment = require('moment');

const Order = require('../../models/order.model');
const City = require('../../models/city.model');

const variableConfig = require('../../configs/variable');

const list = async (req, res) => {
  const find = {
    deleted: false
  };

  const orderList = await Order.find(find).sort({
    createdAt: 'desc'
  });

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
    orderList
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

module.exports = {
  list,
  edit,
  editPatch
};
