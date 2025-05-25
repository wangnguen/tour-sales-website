const moment = require('moment');

const Order = require('../../models/order.model');

const variableConfig = require('../../configs/variable');

const dashboard = async (req, res) => {
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

  res.render('admin/pages/dashboard', {
    titlePage: 'Trang tổng quan',
    orderList
  });
};

module.exports = {
  dashboard
};
