const moment = require('moment');

const Category = require('../../models/category.model');
const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');

const categoryHelper = require('../../helpers/category.helper');

const list = async (req, res) => {
  // Lấy slug từ params
  const slug = req.params.slug;

  // Tìm danh mục theo slug
  const category = await Category.findOne({
    slug: slug,
    deleted: false,
    status: 'active'
  });

  if (category) {
    // Breadcrumb
    var breadcrumb = {
      image: category.avatar,
      title: category.name,
      list: [
        {
          link: '/',
          title: 'Trang chủ'
        }
      ]
    };
    // Tìm danh mục cha
    if (category.parent) {
      const parentCategory = await Category.findOne({
        _id: category.parent,
        deleted: false,
        status: 'active'
      });

      if (parentCategory) {
        breadcrumb.list.push({
          link: `/category/${parentCategory.slug}`,
          title: parentCategory.name
        });
      }
    }

    // Thêm danh mục hiện tại
    breadcrumb.list.push({
      link: `/category/${category.slug}`,
      title: category.name
    });

    // End breadcrumb

    // Danh sách danh mục con
    const listCategoryId = await categoryHelper.getAllSubcategoryIds(category.id);

    const find = {
      category: { $in: listCategoryId },
      deleted: false,
      status: 'active'
    };

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
    const totalRecord = await Tour.countDocuments(find);
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

    // Sap xep
    let sortOption = {};
    const sortQuery = req.query.sort || '';
    switch (sortQuery) {
      case 'price-asc':
        sortOption = { priceNewAdult: 'asc' };
        break;
      case 'price-desc':
        sortOption = { priceNewAdult: 'desc' };
        break;
      default:
        sortOption = { position: 'asc' };
        break;
    }
    let tourList;

    if (sortQuery === 'discount') {
      const allTours = await Tour.find(find).skip(skip).limit(limitItems);

      tourList = allTours
        .map((t) => {
          const discountRate = t.priceAdult && t.priceNewAdult ? (t.priceAdult - t.priceNewAdult) / t.priceAdult : 0;
          return { ...t.toObject(), discountRate };
        })
        .sort((a, b) => b.discountRate - a.discountRate);
    } else {
      tourList = await Tour.find(find).sort(sortOption).skip(skip).limit(limitItems);
    }
    // Het sap xep

    for (const item of tourList) {
      item.departureDateFormat = moment(item.departureDate).format('DD/MM/YYYY');
    }
    // End danh sách tour

    // Danh sách thành phố
    const cityList = await City.find({});
    // Hết Danh sách thành phố
    res.render('client/pages/tour_list', {
      titlePage: 'Danh sách tour',
      breadcrumb: breadcrumb,
      category: category,
      tourList: tourList,
      totalTour: pagination.totalRecord,
      cityList: cityList,
      pagination
    });
  } else {
    res.redirect('/');
  }
};
module.exports = { list };
