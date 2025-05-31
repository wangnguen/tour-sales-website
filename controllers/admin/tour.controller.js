const moment = require('moment');
const slugify = require('slugify');

const Category = require('../../models/category.model');
const City = require('../../models/city.model');
const Tour = require('../../models/tour.model');

const AccountAdmin = require('../../models/admin_account.model');

const categoryHelper = require('../../helpers/category.helper');

const list = async (req, res) => {
  const find = {
    deleted: false
  };
  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Hết lọc theo trạng thái

  // Lọc theo người tạo
  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }
  // Hết Lọc theo người tạo

  // Tìm kiếm
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: 'vi'
    });
    const keywordRegex = new RegExp(keyword, 'i');
    find.slug = keywordRegex;
  }
  // Hết Tìm kiếm

  // Lọc theo ngày tạo
  const dateFilter = {};

  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf('date').toDate();
    dateFilter.$gte = startDate;
  }

  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf('date').toDate();
    dateFilter.$lte = endDate;
  }

  if (Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }
  // Hết Lọc theo ngày tạo

  // Lọc theo danh mục
  const categoryList = await Category.find(find).sort({});
  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  if (req.query.category) {
    find.category = req.query.category;
  }
  // Hết lọc theo danh mục

  // Lọc mức giá
  const dataPriceLevel = {};

  if (req.query.priceLevel) {
    const [priceMin, priceMax] = req.query.priceLevel.split('-').map((item) => parseInt(item));
    find.priceNewAdult = {
      $gte: priceMin,
      $lte: priceMax
    };
  }

  if (Object.keys(dataPriceLevel).length > 0) {
    find.priceNewAdult = dataPriceLevel;
  }

  // Hết lọc mức giá

  // Phân trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Tour.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  if (totalPage === 0) {
    page = 1;
  } else if (page > totalPage) {
    page = totalPage;
  }
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const tourList = await Tour.find(find)
    .sort({
      position: 'desc'
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of tourList) {
    if (item.createdBy) {
      const infoAccountCreated = await AccountAdmin.findOne({
        _id: item.createdBy
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }

    if (item.updatedBy) {
      const infoAccountUpdated = await AccountAdmin.findOne({
        _id: item.updatedBy
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }

    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
  }

  // Danh sách tài khoản quản trị
  const accountAdminList = await AccountAdmin.find({}).select('id fullName');
  // Hết Danh sách tài khoản quản trị

  res.render('admin/pages/tour_list', {
    titlePage: 'Quản lý tour',
    tourList: tourList,
    accountAdminList: accountAdminList,
    categoryList: categoryTree,
    pagination: pagination
  });
};

const create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false
  });

  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  const cityList = await City.find({});

  res.render('admin/pages/tour_create', {
    titlePage: 'Tạo tour',
    categoryList: categoryTree,
    cityList: cityList
  });
};

const createPost = async (req, res) => {
  if (!req.permissions.includes('tour-create')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalRecord = await Tour.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  if (req.files && req.files.avatar) {
    req.body.avatar = req.files.avatar[0].path;
  } else {
    delete req.body.avatar;
  }

  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
  req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;

  req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
  req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : req.body.priceChildren;
  req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;

  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
  req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];

  req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;

  req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

  if (req.files && req.files.images && req.files.images.length > 0) {
    req.body.images = req.files.images.map((file) => file.path);
  } else {
    delete req.body.images;
  }

  const newRecord = new Tour(req.body);
  await newRecord.save();

  req.flash('success', 'Tạo tour thành công !');

  res.json({
    code: 'success'
  });
};

const edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false
    });

    if (tourDetail) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format('YYYY-MM-DD');

      const categoryList = await Category.find({
        deleted: false
      });

      const categoryTree = categoryHelper.buildCategoryTree(categoryList);

      const cityList = await City.find({});

      res.render('admin/pages/tour_edit', {
        titlePage: 'Chỉnh sửa tour',
        categoryList: categoryTree,
        cityList: cityList,
        tourDetail: tourDetail
      });
    } else {
      res.redirect(`/${pathAdmin}/tour/list`);
    }
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
};

const editPatch = async (req, res) => {
  if (!req.permissions.includes('tour-edit')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }
  try {
    const id = req.params.id;

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.updatedBy = req.account.id;
    if (req.files && req.files.avatar) {
      req.body.avatar = req.files.avatar[0].path;
    } else {
      delete req.body.avatar;
    }

    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;

    req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
    req.body.priceNewChildren = req.body.priceNewChildren
      ? parseInt(req.body.priceNewChildren)
      : req.body.priceChildren;
    req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;

    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];

    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;

    req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map((file) => file.path);
    } else {
      delete req.body.images;
    }

    await Tour.updateOne(
      {
        _id: id,
        deleted: false
      },
      req.body
    );

    req.flash('success', 'Cập nhật tour thành công!');
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không hợp lệ!'
    });
  }
};

const deletePatch = async (req, res) => {
  if (!req.permissions.includes('tour-delete')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;
    await Tour.updateOne(
      {
        _id: id
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now()
      }
    );
    req.flash('success', 'Xoá tour thành công !');
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không hợp lệ !'
    });
  }
};

const trash = async (req, res) => {
  const find = {
    deleted: true
  };

  // Tìm kiếm
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: 'vi'
    });
    const keywordRegex = new RegExp(keyword, 'i');
    find.slug = keywordRegex;
  }
  // Hết Tìm kiếm

  // Phân trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Tour.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  if (totalPage === 0) {
    page = 1;
  } else if (page > totalPage) {
    page = totalPage;
  }
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const tourList = await Tour.find(find)
    .sort({
      deletedAt: 'desc'
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of tourList) {
    if (item.createdBy) {
      const infoAccountCreated = await AccountAdmin.findOne({
        _id: item.createdBy
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }

    if (item.deletedBy) {
      const infoAccountDeleted = await AccountAdmin.findOne({
        _id: item.deletedBy
      });
      item.deletedByFullName = infoAccountDeleted.fullName;
    }

    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.deletedAtFormat = moment(item.deletedAt).format('HH:mm - DD/MM/YYYY');
  }

  res.render('admin/pages/tour_trash', {
    titlePage: 'Thùng rác tour',
    tourList: tourList,
    pagination: pagination
  });
};

const undoPatch = async (req, res) => {
  if (!req.permissions.includes('tour-trash')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;
    await Tour.updateOne(
      {
        _id: id
      },
      {
        deleted: false
      }
    );
    req.flash('success', 'Khôi phục tour thành công !');
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không hợp lệ !'
    });
  }
};

const deleteDestroyPatch = async (req, res) => {
  if (!req.permissions.includes('tour-trash')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;
    await Tour.deleteOne({
      _id: id
    });

    req.flash('success', 'Đã xoá vĩnh viễn tour thành công !');

    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không hợp lệ !'
    });
  }
};

const trashChangeMultiPatch = async (req, res) => {
  if (!req.permissions.includes('tour-trash')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const { option, ids } = req.body;

    switch (option) {
      case 'undo':
        await Tour.updateMany(
          {
            _id: { $in: ids }
          },
          {
            deleted: false
          }
        );
        req.flash('success', 'Khôi phục thành công!');
        break;
      case 'delete-destroy':
        await Tour.deleteMany({
          _id: { $in: ids }
        });
        req.flash('success', 'Xóa viễn viễn thành công!');
        break;
    }

    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không tồn tại trong hệ thông!'
    });
  }
};

const changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;
    switch (option) {
      case 'active':
      case 'inactive':
        if (!req.permissions.includes('tour-edit')) {
          res.json({
            code: 'error',
            message: 'Không có quyến sử dụng tính năng này !'
          });
          return;
        }
        await Tour.updateMany(
          {
            _id: { $in: ids }
          },
          {
            status: option
          }
        );
        req.flash('success', 'Đổi trạng thái thành công !');
        break;

      case 'delete':
        if (!req.permissions.includes('tour-delete')) {
          res.json({
            code: 'error',
            message: 'Không có quyến sử dụng tính năng này !'
          });
          return;
        }
        await Tour.updateMany(
          {
            _id: { $in: ids }
          },
          {
            deleted: true,
            deletedBy: req.account.id,
            deletedAt: Date.now()
          }
        );
        req.flash('success', 'Xoá thành công !');
        break;
    }
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không tồn tại trong hệ thống !'
    });
  }
};

module.exports = {
  list,
  create,
  createPost,
  edit,
  editPatch,
  trash,
  deletePatch,
  undoPatch,
  deleteDestroyPatch,
  trashChangeMultiPatch,
  changeMultiPatch
};
