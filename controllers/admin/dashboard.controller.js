const moment = require('moment');

const Order = require('../../models/order.model');
const AccountAdmin = require('../../models/admin_account.model');
const variableConfig = require('../../configs/variable');

const dashboard = async (req, res) => {
  // Section 3
  const find = {
    deleted: false
  };

  const orderList = await Order.find(find)
    .sort({
      createdAt: 'desc'
    })
    .limit(10);

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
  // End section 3

  // Section 1
  const overView = {
    totalAdmin: 0,
    totalUser: 0,
    totalOrder: 0,
    totalPrice: 0
  };

  overView.totalAdmin = await AccountAdmin.countDocuments({
    deleted: false
  });

  const orderListSection1 = await Order.find({
    deleted: false
  });
  overView.totalOrder = orderListSection1.length;

  overView.totalPrice = orderListSection1.reduce((sum, item) => {
    return sum + item.total;
  }, 0);
  // End section 1

  res.render('admin/pages/dashboard', {
    titlePage: 'Trang tổng quan',
    orderList,
    overView
  });
};

const revenueChartPost = async (req, res) => {
  const { currentMonth, currentYear, previousMonth, previousYear, arrayDay } = req.body;

  // Truy vấn tất cả đơn hàng trong tháng hiện tại
  const orderCurrentMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1)
    }
  });

  // Truy vấn tất cả đơn hàng trong tháng trước
  const orderPreviousMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(previousYear, previousMonth - 1, 1),
      $lt: new Date(previousYear, previousMonth, 1)
    }
  });

  // Tạo mảng doanh thu theo từng ngày
  const dataMonthCurrent = [];
  const dataMonthPrevious = [];

  for (const day of arrayDay) {
    // Tính tổng doanh thu theo từng ngày của tháng hiện tại
    let totalCurrent = 0;
    for (const order of orderCurrentMonth) {
      const orderDate = new Date(order.createdAt).getDate();
      if (day === orderDate) {
        totalCurrent += order.total;
      }
    }
    dataMonthCurrent.push(totalCurrent);

    // Tính tổng doanh thu theo từng ngày của tháng trước
    let totalPrevious = 0;
    for (const order of orderPreviousMonth) {
      const orderDate = new Date(order.createdAt).getDate();
      if (day === orderDate) {
        totalPrevious += order.total;
      }
    }
    dataMonthPrevious.push(totalPrevious);
  }

  res.json({
    code: 'success',
    dataMonthCurrent,
    dataMonthPrevious
  });
};

module.exports = {
  dashboard,
  revenueChartPost
};
