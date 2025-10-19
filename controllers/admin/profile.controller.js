const bcrypt = require('bcryptjs');

const AccountAdmin = require('../../models/admin_account.model');

const profileEdit = (req, res) => {
  res.render('admin/pages/profile_edit', {
    titlePage: 'Thông tin cá nhân'
  });
};

const profileEditPatch = async (req, res) => {
  try {
    const id = req.account.id;

    req.body.updatedBy = req.account.id;
    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    await AccountAdmin.updateOne(
      {
        _id: id,
        deleted: false
      },
      req.body
    );

    req.flash('success', 'Cập nhật thông tin thành công!');

    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: error
    });
  }
};

const profileChangePassword = (req, res) => {
  res.render('admin/pages/profile_change_password', {
    titlePage: 'Đổi mật khẩu'
  });
};

const profileChangePasswordPatch = async (req, res) => {
  try {
    const id = req.account.id;

    req.body.updatedBy = id;

    // Mã hóa mật khẩu với bcrypt
    const salt = await bcrypt.genSalt(10); // Tạo ra chuỗi ngẫu nhiên có 10 ký tự
    req.body.password = await bcrypt.hash(req.body.password, salt);

    await AccountAdmin.updateOne(
      {
        _id: id,
        deleted: false
      },
      req.body
    );

    req.flash('success', 'Đổi mật khẩu thành công!');

    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: error
    });
  }
};

module.exports = {
  profileEdit,
  profileEditPatch,
  profileChangePassword,
  profileChangePasswordPatch
};
