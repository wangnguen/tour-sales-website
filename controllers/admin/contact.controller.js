const moment = require('moment');
const Contact = require('../../models/contact.model');

const list = async (req, res) => {
  const find = {
    deleted: false
  };

  // Loc theo ngay tao
  const dataFilter = {};

  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf('date').toDate();
    dataFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf('date').toDate();
    dataFilter.$lte = endDate;
  }
  if (Object.keys(dataFilter).length > 0) {
    find.createdAt = dataFilter;
  }
  // Het loc theo ngay tao

  // Tim kiem
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: 'vi'
    });
    const keywordRegex = new RegExp(keyword, 'i');

    find.slug = keywordRegex;
  }
  // Het tim kiem

  // Phan trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Contact.countDocuments(find).lean();
  const totalPage = Math.max(Math.ceil(totalRecord / limitItems), 1);
  if (page > totalPage) {
    page = totalPage;
  }
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Het phan trang

  const contactList = await Contact.find(find)
    .sort({
      createdAt: 'desc'
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }

  res.render('admin/pages/contact_list', {
    titlePage: 'Thông tin liên hệ',
    contactList: contactList,
    pagination
  });
};

module.exports = {
  list
};
