const moment = require('moment');

const Tour = require('../../models/tour.model');
const News = require('../../models/news.model');

const categoryHelper = require('../../helpers/category.helper');

const homeController = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour.find({
    deleted: false,
    status: 'active'
  })
    .sort({
      position: 'desc'
    })
    .limit(6);
  let discountPrice = 0;
  for (const item of tourListSection2) {
    item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');

    discountPrice = Math.max(parseInt(item.priceAdult - item.priceNewAdult), discountPrice);
  }
  // End section 2

  // Section 4: Tour trong nước
  const categoryIdSection4 = '67fe66a0cb97940480be72b7';

  const listCategoryId = await categoryHelper.getAllSubcategoryIds(categoryIdSection4);

  const tourListSection4 = await Tour.find({
    category: { $in: listCategoryId },
    deleted: false,
    status: 'active'
  })
    .sort({
      position: 'desc'
    })
    .limit(3);

  for (const item of tourListSection4) {
    item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');
  }
  // End section 4 : Tour trong nước

  // Section 6: Tour nước ngoài
  const categoryIdSection6 = '67fe6a227f9e79da07fab162';

  const listCategoryIdAbroad = await categoryHelper.getAllSubcategoryIds(categoryIdSection6);

  const tourListSection6 = await Tour.find({
    category: { $in: listCategoryIdAbroad },
    deleted: false,
    status: 'active'
  })
    .sort({
      position: 'desc'
    })
    .limit(3);

  for (const item of tourListSection6) {
    item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');
  }
  // End section 4 : Tour nước ngoài

  // Section 8: Tin tức
  const newsList = await News.find({
    deleted: false,
    status: 'active'
  })
    .sort({
      position: 'asc'
    })
    .limit(5);
  newsList.createdAtFormat = moment(newsList.createdAt).format('DD/MM/YYYY');
  // End Section 8: Tin tức

  res.render('client/pages/home', {
    titlePage: 'Trang chủ',
    tourListSection2,
    tourListSection4,
    tourListSection6,
    newsList,
    discountPrice
  });
};
module.exports = { homeController };
