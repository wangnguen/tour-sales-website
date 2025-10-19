const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');
const moment = require('moment');

const cart = (req, res) => {
  res.render('client/pages/cart', {
    titlePage: 'Giỏ hàng'
  });
};

const detail = async (req, res) => {
  const cart = req.body;

  for (const item of cart) {
    const tourInfo = await Tour.findOne({
      _id: item.tourId,
      status: 'active',
      deleted: false
    });

    if (tourInfo) {
      item.avatar = tourInfo.avatar;
      item.name = tourInfo.name;
      item.slug = tourInfo.slug;
      item.departureDateFormat = moment(tourInfo.departureDate).format('DD/MM/YYYY');
      item.priceNewAdult = tourInfo.priceNewAdult;
      item.priceNewChildren = tourInfo.priceNewChildren;
      item.priceNewBaby = tourInfo.priceNewBaby;

      const city = await City.findOne({
        _id: item.locationFrom
      });
      item.locationFromName = city.name;
    } else {
      // Nếu không lấy được tour thì xóa tour khỏi giỏ hàng
      const indexItem = cart.findIndex((tour) => tour.tourId == item.tourId);
      cart.splice(indexItem, 1);
    }
  }

  res.json({
    code: 'success',
    cart: cart
  });
};

module.exports = { cart, detail };
