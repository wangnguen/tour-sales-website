const moment = require('moment');

const Order = require('../../models/order.model');
const Tour = require('../../models/tour.model');

const variableConfig = require('../../configs/variable');
const { generateRandomNumber } = require('../../helpers/generate.helper');
const City = require('../../models/city.model');

const createPost = async (req, res) => {
  try {
    // Mã đơn hàng
    req.body.orderCode = 'OD' + generateRandomNumber(10);

    // Danh sách tour
    for (const item of req.body.items) {
      const infoTour = await Tour.findOne({
        _id: item.tourId,
        status: 'active',
        deleted: false
      });
      if (infoTour) {
        // Thêm giá
        item.priceNewAdult = infoTour.priceNewAdult;
        item.priceNewChildren = infoTour.priceNewChildren;
        item.priceNewBaby = infoTour.priceNewBaby;
        // Ngày khởi hành
        item.departureDate = infoTour.departureDate;
        // Ảnh
        item.avatar = infoTour.avatar;
        // Tiêu đề
        item.name = infoTour.name;

        // Cập nhật lại số lượng còn lại của tour
        if (
          infoTour.stockAdult < item.quantityAdult ||
          infoTour.stockChildren < item.quantityChildren ||
          infoTour.stockBaby < item.quantityBaby
        ) {
          res.json({
            code: 'error',
            message: `Số lượng chỗ của tour ${item.name} đã hết, vui lòng chọn lại`
          });
          return;
        }

        await Tour.updateOne(
          {
            _id: item.tourId
          },
          {
            stockAdult: infoTour.stockAdult - item.quantityAdult,
            stockChildren: infoTour.stockChildren - item.quantityChildren,
            stockBaby: infoTour.stockBaby - item.quantityBaby
          }
        );
      }
    }

    // Thanh toán
    // Tạm tính
    req.body.subTotal = req.body.items.reduce((sum, item) => {
      return (
        sum +
        (item.priceNewAdult * item.quantityAdult +
          item.priceNewChildren * item.quantityChildren +
          item.priceNewBaby * item.quantityBaby)
      );
    }, 0);

    // Giảm
    req.body.discount = 0;
    // Thanh toán
    req.body.total = req.body.subTotal - req.body.discount;
    // Trạng thái thanh toán
    req.body.paymentStatus = 'unpaid'; // unpaid: chua thanh toan, "paid": da thanh toan

    // Trạng thái đơn hàng
    req.body.status = 'initial'; // initial: khoi tao, done: da hoan thanh, cancel: huy2
    const newRecord = new Order(req.body);
    await newRecord.save();

    res.json({
      code: 'success',
      message: 'Đặt hàng thành công !',
      orderId: newRecord.id
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 'error',
      message: 'Đặt hàng không thành công !'
    });
  }
};

const success = async (req, res) => {
  try {
    const { orderId, phone } = req.query;

    const orderDetail = await Order.findOne({
      _id: orderId,
      phone: phone
    });

    if (!orderDetail) {
      res.redirect('/');
      return;
    }

    orderDetail.paymentMethodName = variableConfig.paymentMethod.find(
      (item) => item.value === orderDetail.paymentMethod
    ).label;

    orderDetail.paymentStatusName = variableConfig.paymentStatus.find(
      (item) => item.value === orderDetail.paymentStatus
    ).label;

    orderDetail.statusName = variableConfig.orderStatus.find((item) => item.value === orderDetail.status).label;

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format('HH:mm - DD/MM/YYYY');

    for (const item of orderDetail.items) {
      const infoTour = Tour.findOne({
        _id: item.tourId,
        deleted: false
      });
      if (infoTour) {
        item.slug = infoTour.slug;
      }

      item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');

      const city = await City.findOne({
        _id: item.locationFrom
      });
      if (city) {
        item.locationFromName = city.name;
      }
    }

    res.render('client/pages/order_success', {
      titlePage: 'Đặt hàng thành công',
      orderDetail
    });
  } catch (error) {
    res.redirect('/');
  }
};

module.exports = { createPost, success };
