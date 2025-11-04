const { default: slugify } = require('slugify');
const User = require('../../models/user.model');
const moment = require('moment');

const ITEMS_PER_PAGE = 5;

const buildSearchQuery = (queryParams) => {
  const find = { deleted: false };

  // Filter by status
  if (queryParams.status) {
    find.status = queryParams.status;
  }

  // Filter by creation date
  if (queryParams.startDate || queryParams.endDate) {
    const dateFilter = {};

    if (queryParams.startDate) {
      dateFilter.$gte = moment(queryParams.startDate).startOf('date').toDate();
    }

    if (queryParams.endDate) {
      dateFilter.$lte = moment(queryParams.endDate).endOf('date').toDate();
    }

    if (Object.keys(dateFilter).length > 0) {
      find.createdAt = dateFilter;
    }
  }

  // Keyword search
  if (queryParams.keyword) {
    const keyword = slugify(queryParams.keyword, { lower: true, locale: 'vi' });
    find.fullName = new RegExp(keyword, 'i');
  }

  return find;
};

const getPaginationInfo = async (query, find) => {
  const currentPage = Math.max(1, parseInt(query.page) || 1);
  const totalRecord = await User.countDocuments(find);
  const totalPage = Math.max(Math.ceil(totalRecord / ITEMS_PER_PAGE), 1);
  const page = Math.min(currentPage, totalPage);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  return {
    skip,
    totalRecord,
    totalPage,
    currentPage: page,
    limit: ITEMS_PER_PAGE
  };
};

const list = async (req, res) => {
  try {
    const find = buildSearchQuery(req.query);
    const pagination = await getPaginationInfo(req.query, find);

    const [userList] = await Promise.all([
      User.find(find).sort({ createdAt: -1 }).limit(pagination.limit).skip(pagination.skip)
    ]);

    res.render('admin/pages/user_list', {
      titlePage: 'Quản lý người dùng',
      userList,
      pagination
    });
  } catch (error) {
    console.error('Category list error:', error);
    req.flash('error', 'Có lỗi xảy ra, vui lòng thử lại!');
    res.redirect(`/${pathAdmin}/dashboard`);
  }
};

const deletePatch = async (req, res) => {
  try {
    if (!req.permissions.includes('user-delete')) {
      return res.status(403).json({
        code: 'error',
        message: 'Không có quyền sử dụng tính năng này!'
      });
    }

    const id = req.params.id;
    const result = await User.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: new Date()
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        code: 'error',
        message: 'Không tìm thấy người dùng!'
      });
    }

    req.flash('success', 'Xóa người dùng thành công!');
    res.json({ code: 'success' });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

const changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 'error',
        message: 'Vui lòng chọn ít nhất một người dùng!'
      });
    }

    let updateData;
    let permission;

    switch (option) {
      case 'active':
      case 'inactive':
        permission = 'user-edit';
        updateData = {
          status: option,
          updatedBy: req.account.id,
          updatedAt: new Date()
        };
        break;
      case 'delete':
        permission = 'user-delete';
        updateData = {
          deleted: true,
          deletedBy: req.account.id,
          deletedAt: new Date()
        };
        break;

      default:
        return res.status(400).json({
          code: 'error',
          message: 'Hành động không hợp lệ!'
        });
    }

    if (!req.permissions.includes(permission)) {
      return res.status(403).json({
        code: 'error',
        message: 'Không có quyền sử dụng tính năng này!'
      });
    }

    const message = {
      active: 'Kích hoạt người dùng thành công!',
      inactive: 'Vô hiệu hóa người dùng thành công!',
      delete: 'Xóa người dùng thành công!'
    };

    const result = await User.updateMany({ _id: { $in: ids } }, updateData);

    if (result.matchedCount === 0) {
      return res.json({
        code: 'error',
        message: 'Không tìm thấy người dùng nào!'
      });
    }

    req.flash('success', message[option]);
    res.json({ code: 'success' });
  } catch (error) {
    console.error('User change multi error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

module.exports = {
  list,
  deletePatch,
  changeMultiPatch
};
