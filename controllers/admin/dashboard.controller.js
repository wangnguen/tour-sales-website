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

  overView.totalOrder = orderList.length;

  overView.totalPrice = orderList.reduce((sum, item) => {
    return sum + item.total;
  }, 0);
  // End section 1

  res.render('admin/pages/dashboard', {
    titlePage: 'Trang tổng quan',
    orderList,
    overView
  });
};

module.exports = {
  dashboard
};
