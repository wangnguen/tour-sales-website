const moment = require('moment');

const Order = require('../../models/order.model');
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

const edit = (req, res) => {
  res.render('admin/pages/order_edit', {
    titlePage: 'Đơn hàng: OD000001'
  });
};

module.exports = {
  list,
  edit
};
