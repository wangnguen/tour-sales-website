const moment = require('moment');
const slugify = require('slugify');
const AccountAdmin = require('../../models/admin_account.model');
const News = require('../../models/news.model');

const list = async (req, res) => {
  const find = {
    deleted: false
  };

  // Loc theo trang thai
  if (req.query.status) {
    find.status = req.query.status;
  }
  // Het loc theo trang thai

  // Loc theo nguoi tao
  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }
  // Het loc theo nguoi tao

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
  const totalRecord = await News.countDocuments(find);
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

  const newsList = await News.find(find)
    .sort({
      position: 'desc'
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of newsList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findById(item.createdBy).select('fullName').lean();
      item.createdByFullName = infoAccount ? infoAccount.fullName : '';
    }
    if (item.updatedBy) {
      const infoAccount = await AccountAdmin.findById(item.updatedBy).select('fullName').lean();
      item.updatedByFullName = infoAccount ? infoAccount.fullName : '';
    }
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
  }

  // Danh sach tai khoan quan tri
  const accountAdminList = await AccountAdmin.find({}).select('id fullName');
  // Het danh sach tai khoan quan tri

  res.render('admin/pages/news_list', {
    titlePage: 'Quản lý tin tức',
    newsList,
    accountAdminList,
    pagination
  });
};

const create = async (req, res) => {
  res.render('admin/pages/news_create', {
    titlePage: 'Tạo bài viết mới'
  });
};

const createPost = async (req, res) => {
  if (!req.permissions.includes('news-create')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalRecord = await News.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : '';

  const newRecord = new News(req.body);
  await newRecord.save();

  req.flash('success', 'Tạo bài viết thành công!');

  res.json({
    code: 'success'
  });
};

const edit = async (req, res) => {
  try {
    const id = req.params.id;

    const newsDetail = await News.findOne({
      _id: id,
      deleted: false
    });

    if (newsDetail) {
      res.render('admin/pages/news_edit', {
        titlePage: 'Chỉnh sửa bài viết',
        newsDetail: newsDetail
      });
    } else {
      res.redirect(`/${pathAdmin}/news/list`);
    }
  } catch (error) {
    res.redirect(`/${pathAdmin}/news/list`);
  }
};

const editPatch = async (req, res) => {
  if (!req.permissions.includes('news-edit')) {
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
      const totalRecord = await News.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.updatedBy = req.account.id;
    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    await News.updateOne(
      {
        _id: id,
        deleted: false
      },
      req.body
    );

    req.flash('success', 'Cập nhật bài viết thành công!');

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
  if (!req.permissions.includes('news-delete')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;

    await News.updateOne(
      {
        _id: id,
        deleted: false
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now()
      }
    );

    req.flash('success', 'Xóa bài viết thành công!');

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

const changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;
    switch (option) {
      case 'active':
      case 'inactive':
        if (!req.permissions.includes('news-edit')) {
          res.json({
            code: 'error',
            message: 'Không có quyến sử dụng tính năng này !'
          });
          return;
        }

        await News.updateMany(
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
        if (!req.permissions.includes('news-delete')) {
          res.json({
            code: 'error',
            message: 'Không có quyến sử dụng tính năng này !'
          });
          return;
        }
        await News.updateMany(
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

const trash = async (req, res) => {
  if (!req.permissions.includes('news-trash')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

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
  const totalRecord = await News.countDocuments(find);
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
  // Hết Phân trang

  const newsList = await News.find(find)
    .sort({
      deletedAt: 'desc'
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of newsList) {
    if (item.createdBy) {
      const infoAccountCreated = await AccountAdmin.findOne({
        _id: item.createdBy
      }).lean();
      item.createdByFullName = infoAccountCreated.fullName;
    }

    if (item.deletedBy) {
      const infoAccountDeleted = await AccountAdmin.findOne({
        _id: item.deletedBy
      }).lean();
      item.deletedByFullName = infoAccountDeleted.fullName;
    }

    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.deletedAtFormat = moment(item.deletedAt).format('HH:mm - DD/MM/YYYY');
  }

  res.render('admin/pages/news_trash', {
    titlePage: 'Thùng rác',
    newsList: newsList,
    pagination
  });
};

const trashChangeMultiPatch = async (req, res) => {
  if (!req.permissions.includes('news-trash')) {
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
        await News.updateMany(
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
        await News.deleteMany({
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

const undoPatch = async (req, res) => {
  if (!req.permissions.includes('news-trash')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;
    await News.updateOne(
      {
        _id: id
      },
      {
        deleted: false
      }
    );
    req.flash('success', 'Khôi phục thành công !');
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

const deleteDestroy = async (req, res) => {
  if (!req.permissions.includes('news-trash')) {
    res.json({
      code: 'error',
      message: 'Không có quyến sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;
    await News.deleteOne({
      _id: id
    });

    req.flash('success', 'Đã xoá vĩnh viễn thành công !');

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

module.exports = {
  list,
  create,
  createPost,
  edit,
  editPatch,
  deletePatch,
  changeMultiPatch,
  trash,
  trashChangeMultiPatch,
  undoPatch,
  deleteDestroy
};
