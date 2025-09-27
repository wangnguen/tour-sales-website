const login = (req, res) => {
  res.render('client/pages/login', {
    titlePage: 'Đăng nhập'
  });
};

const register = (req, res) => {
  res.render('client/pages/register', {
    titlePage: 'Đăng kí'
  });
};

const registerInitial = (req, res) => {
  res.render('client/pages/register_initial', {
    titlePage: 'Tài khoản đã được khởi tạo'
  });
};

const forgotPassword = (req, res) => {
  res.render('client/pages/forgot_password', {
    titlePage: 'Quên mật khẩu'
  });
};

const otpPassword = (req, res) => {
  res.render('client/pages/otp_password', {
    titlePage: 'Nhập mã OTP'
  });
};

const resetPassword = (req, res) => {
  res.render('client/pages/reset_password', {
    titlePage: 'Đổi mật khẩu'
  });
};

module.exports = { login, register, registerInitial, forgotPassword, otpPassword, resetPassword };
