const slugify = require('slugify');
const moment = require('moment');
const News = require('../../models/news.model');
const AccountAdmin = require('../../models/admin_account.model');

const list = async (req, res) => {
  const find = {
    deleted: false
  };
  // Tim kiem
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: 'vi'
    });
    const keywordRegex = RegExp(keyword, 'i');
    find.slug = keywordRegex;
  }
  // Het tim kiem

  // Phan trang
  let page = 1;
  const limitItems = 3;
  const maxVisible = 2;

  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await News.countDocuments(find);
  const totalPage = Math.max(Math.ceil(totalRecord / limitItems), 1);
  if (page > totalPage) {
    page = totalPage;
  }
  const skip = (page - 1) * limitItems;

  let startPage = page;
  let endPage = page + maxVisible - 1;

  if (endPage > totalPage) {
    endPage = totalPage;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }

  const pagination = {
    currentPage: page,
    skip,
    totalRecord,
    totalPage,
    startPage,
    endPage
  };
  // Het phan trang

  const news = await News.find(find).limit(limitItems).skip(skip);

  res.render('client/pages/news_list', {
    titlePage: 'Tin tức',
    news,
    pagination
  });
};

const detail = async (req, res) => {
  const slug = req.params.slug;
  const newsDetail = await News.findOne({
    slug: slug
  });
  // Format ngày tạo
  newsDetail.createdAtFormat = moment(newsDetail?.createdAt).format('DD/MM/YYYY');

  res.render('client/pages/news_detail', {
    titlePage: newsDetail.name,
    newsDetail
  });
};

module.exports = { list, detail };
