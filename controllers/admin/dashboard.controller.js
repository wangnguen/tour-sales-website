const moment = require('moment');

const Order = require('../../models/order.model');
const AccountAdmin = require('../../models/admin_account.model');
const variableConfig = require('../../configs/variable');
const User = require('../../models/user.model');

const dashboard = async (req, res) => {
  // Prepare lookup maps for status and payment info
  const paymentMethodMap = variableConfig.paymentMethod.reduce((map, item) => {
    map[item.value] = item.label;
    return map;
  }, {});

  const paymentStatusMap = variableConfig.paymentStatus.reduce((map, item) => {
    map[item.value] = item.label;
    return map;
  }, {});

  const orderStatusMap = variableConfig.orderStatus.reduce((map, item) => {
    map[item.value] = item.label;
    return map;
  }, {});

  // Get data in parallel
  const [recentOrders, totalAdmin, allOrders, totalUser] = await Promise.all([
    Order.find({ deleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    AccountAdmin.countDocuments({ deleted: false }),
    Order.find({ deleted: false }).select('total').lean(),
    User.countDocuments({ deleted: false })
  ]);

  // Process recent orders
  const orderList = recentOrders.map((order) => ({
    ...order,
    paymentMethodName: paymentMethodMap[order.paymentMethod],
    paymentStatusName: paymentStatusMap[order.paymentStatus],
    statusName: orderStatusMap[order.status],
    createdAtTime: moment(order.createdAt).format('HH:mm'),
    createdAtDate: moment(order.createdAt).format('DD/MM/YYYY')
  }));

  // Calculate overview statistics
  const overView = {
    totalAdmin,
    totalUser,
    totalOrder: allOrders.length,
    totalPrice: allOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  };
  // End section 1

  res.render('admin/pages/dashboard', {
    titlePage: 'Trang tổng quan',
    orderList,
    overView
  });
};

const revenueChartPost = async (req, res) => {
  const { currentMonth, currentYear, previousMonth, previousYear, arrayDay } = req.body;

  // Query orders for both months in parallel
  const [currentMonthOrders, previousMonthOrders] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          deleted: false,
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          total: { $sum: '$total' }
        }
      }
    ]),
    Order.aggregate([
      {
        $match: {
          deleted: false,
          createdAt: {
            $gte: new Date(previousYear, previousMonth - 1, 1),
            $lt: new Date(previousYear, previousMonth, 1)
          }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          total: { $sum: '$total' }
        }
      }
    ])
  ]);

  // Create maps for faster lookups
  const currentMonthMap = new Map(currentMonthOrders.map((item) => [item._id, item.total]));
  const previousMonthMap = new Map(previousMonthOrders.map((item) => [item._id, item.total]));

  // Generate revenue arrays
  const dataMonthCurrent = arrayDay.map((day) => currentMonthMap.get(day) || 0);
  const dataMonthPrevious = arrayDay.map((day) => previousMonthMap.get(day) || 0);

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
