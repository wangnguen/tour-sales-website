const Order = require('../../models/order.model');
const Tour = require('../../models/tour.model');

const createPost = async (req, res) => {
  try {
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

const success = (req, res) => {
  res.render('client/pages/order_success', {
    pageTitle: 'Đặt hàng thành công'
  });
};

module.exports = { createPost, success };
