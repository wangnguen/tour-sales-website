const moment = require('moment');
const slugify = require('slugify');
const Tour = require('../../models/tour.model');

const list = async (req, res) => {
  const find = {
    status: 'active',
    deleted: false
  };

  // Điểm đi
  if (req.query.locationFrom) {
    find.locations = req.query.locationFrom;
  }
  // Hết Điểm đi

  // Điểm đến
  if (req.query.locationTo) {
    const keyword = slugify(req.query.locationTo, {
      lower: true,
      locale: 'vi'
    });

    const keywordRegex = new RegExp(keyword, 'i');

    find.slug = keywordRegex;
  }
  // Hết điểm đến

  // Ngày khởi hành

  if (req.query.departureDate) {
    const date = new Date(req.query.departureDate);
    find.departureDate = date;
  }

  // if (req.query.departureDate) {
  // 	const departureDateFilter = {};

  // 	const startDate = moment(req.query.departureDate).startOf("date").toDate();
  // 	departureDateFilter.$gte = startDate;

  // 	const endDate = moment(req.query.departureDate).endOf("date").toDate();
  // 	departureDateFilter.$lte = endDate;

  // 	find.departureDate = departureDateFilter;
  // }

  // Hết ngày khởi hành

  // Số lượng hành khách
  // Người lớn
  if (req.query.stockAdult) {
    find.stockAdult = {
      $gte: parseInt(req.query.stockAdult)
    };
  }
  // Trẻ em
  if (req.query.stockChildren) {
    find.stockChildren = {
      $gte: parseInt(req.query.stockChildren)
    };
  }
  // Em bé
  if (req.query.stockBaby) {
    find.stockBaby = {
      $gte: parseInt(req.query.stockBaby)
    };
  }
  // Hết số lượng hành khách

  // Mức giá
  if (req.query.price) {
    const [priceMin, priceMax] = req.query.price.split('-').map((item) => parseInt(item));

    find.priceNewAdult = {
      $gte: priceMin,
      $lte: priceMax
    };
  }
  // Hết Mức giá

  const tourList = await Tour.find(find).sort({ position: 'desc' });

  for (const item of tourList) {
    item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');
  }

  res.render('client/pages/search', {
    titlePage: 'Kết quả tìm kiếm',
    tourList
  });
};
module.exports = { list };
