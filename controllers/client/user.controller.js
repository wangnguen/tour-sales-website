const bcrypt = require('bcryptjs');
const User = require('../../models/user.model');

const profile = (req, res) => {
  res.render('client/pages/profile_view', {
    titlePage: 'Thông tin cá nhân'
  });
};

const userProfileEdit = (req, res) => {
  res.render('client/pages/profile_edit', {
    titlePage: 'Thông tin cá nhân'
  });
};

const userProfileChangePassword = (req, res) => {
  res.render('client/pages/profile_change_password', {
    titlePage: 'Đổi mật khẩu'
  });
};

const userProfileEditPatch = async (req, res) => {
  try {
    const { id } = req.account;

    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    await User.updateOne({ _id: id, deleted: false }, req.body);

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

const userProfileChangePasswordPatch = async (req, res) => {
  try {
    const id = req.account.id;
    // Mã hóa mật khẩu với bcrypt
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    await User.updateOne(
      {
        _id: id,
        deleted: false
      },
      req.body
    );

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
  profile,
  userProfileEdit,
  userProfileChangePassword,
  userProfileEditPatch,
  userProfileChangePasswordPatch
};
