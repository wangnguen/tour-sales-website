const AccountAdmin = require('../../models/admin_account.model');
const ForgotPassword = require('../../models/forgot_password.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateHelper = require('../../helpers/generate.helper');
const mailHelper = require('../../helpers/mail.helper');

const login = (req, res) => {
  res.render('admin/pages/login', {
    titlePage: 'Đăng nhập'
  });
};

const loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  const existAccount = await AccountAdmin.findOne({ email: email });

  if (!existAccount) {
    res.json({
      code: 'error',
      message: 'Email does not exist in the system !'
    });
    return; // dung chuong trinh
  }

  const isPasswordValid = await bcrypt.compare(password, existAccount.password);

  if (!isPasswordValid) {
    res.json({
      code: 'error',
      message: 'Incorrect password !'
    });
    return;
  }

  if (existAccount.status != 'active') {
    res.json({
      code: 'error',
      message: 'Account not activated !'
    });
    return;
  }

  // Tạo JWT
  const tokenAdmin = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    process.env.JWT_SECRET_ADMIN,
    {
      expiresIn: rememberPassword ? '30d' : '1d' // token co thoi han 30 hoac 1 ngay
    }
  );

  // Lưu token vào cookie
  res.cookie('tokenAdmin', tokenAdmin, {
    maxAge: rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // token hieu luc 30 hoac 1 ngay
    httpOnly: true,
    sameSite: 'strict'
  });
  
  //res.json js -> json: express
  res.json({
    code: 'success',
    message: 'Account login successful !'
  });
};

const register = (req, res) => {
  res.render('admin/pages/register', {
    titlePage: 'Đăng kí'
  });
};

const registerPost = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existAccount = await AccountAdmin.findOne({
    email: email
  });

  if (existAccount) {
    res.json({
      code: 'error',
      message: 'Email already exists in the system'
    });
    return; // dung chuong trinh
  }

  // Mã hoá mật khẩu
  const salt = await bcrypt.genSalt(10); // Tạo ra chuỗi ngẫu nhiên có 10 ký
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = new AccountAdmin({
    fullName: fullName,
    email: email,
    password: hashedPassword,
    status: 'initial'
  });

  await newAccount.save();

  //res.json js -> json: express
  res.json({
    code: 'success',
    message: 'Đăng ký tài khoản thành công !'
  });
};

const registerInitial = (req, res) => {
  res.render('admin/pages/register_initial', {
    titlePage: 'Tài khoản đã được khởi tạo'
  });
};

const forgotPassword = (req, res) => {
  res.render('admin/pages/forgot_password', {
    titlePage: 'Quên mật khẩu'
  });
};

const forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  // ktra email co ton tai hay khong
  const existAccount = AccountAdmin.findOne({ email: email });

  if (!existAccount) {
    res.json({
      code: 'error',
      message: 'Email không tồn tại trong hệ thống'
    });
    return;
  }

  // kiem tra email da ton tai trong ForgotPassword chua ?
  const existEmailInForgotPassword = await ForgotPassword.findOne({
    email: email
  });

  if (existEmailInForgotPassword) {
    res.json({
      code: 'error',
      message: 'Vui lòng gửi lại yêu cầu sau 5 phút'
    });
    return;
  }

  // tao ma otp
  const otp = generateHelper.generateRandomNumber(6);
  // luu vao db: email va otp, sau 5p tu dong xoa
  const newRecord = new ForgotPassword({
    email: email,
    otp: otp,
    expireAt: 5 * 60 * 1000 + Date.now()
  });
  await newRecord.save();

  // gui ma otp qua email cho ng dung
  const subject = `Mã OTP lấy lại mật khẩu`;
  const content = `Mã OTP của bạn là <b style="color: green;">${otp}</b>. Mã otp có hiệu lực trong 5 phút, vui lòng không cung cấp cho bất kì ai!`;
  mailHelper.sendMail(email, subject, content);

  res.json({
    code: 'success',
    message: 'Đã gửi mã otp qua email'
  });
};

const otpPassword = (req, res) => {
  res.render('admin/pages/otp_password', {
    titlePage: 'Nhập mã OTP'
  });
};

const otpPasswordPost = async (req, res) => {
  const { otp, email } = req.body;

  // kiem tra co ton tai ban ghi trong ForgotPassword ko ?
  const existRecord = await ForgotPassword.findOne({ otp: otp, email: email });

  if (!existRecord) {
    res.json({
      code: 'error',
      message: 'Mã OTP không chính xác!'
    });
    return;
  }
  // tim thong tin user trong AccountAdmin
  const account = await AccountAdmin.findOne({
    email: email
  });

  const token = jwt.sign(
    {
      id: account.id,
      email: account.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  // Lưu token vào cookie
  res.cookie('token', token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  });

  res.json({
    code: 'success',
    message: 'Xác thực OTP thành công!'
  });
};

const resetPassword = (req, res) => {
  res.render('admin/pages/reset_password', {
    titlePage: 'Đổi mật khẩu'
  });
};

const resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  // Mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10); // Tạo ra chuỗi ngẫu nhiên có 10 ký tự
  const hashedPassword = await bcrypt.hash(password, salt);

  await AccountAdmin.updateOne(
    {
      _id: req.account.id,
      deleted: false,
      status: 'active'
    },
    {
      password: hashedPassword
    }
  );

  res.json({
    code: 'success',
    message: 'Đổi mật khẩu thành công!'
  });
};

const logoutPost = async (req, res) => {
  res.clearCookie('token');
  res.json({
    code: 'success',
    message: 'Logout Success !'
  });
};

module.exports = {
  login,
  loginPost,
  register,
  registerPost,
  registerInitial,
  forgotPassword,
  forgotPasswordPost,
  otpPassword,
  otpPasswordPost,
  resetPassword,
  resetPasswordPost,
  logoutPost
};
