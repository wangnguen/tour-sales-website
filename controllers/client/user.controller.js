const bcrypt = require('bcryptjs');

const AccountAdmin = require('../../models/admin_account.model');

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

module.exports = {
  profile,
  userProfileEdit,
  userProfileChangePassword
};
