const AccountAdmin = require('../../models/admin_account.model');
const ForgotPassword = require('../../models/forgot_password.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateHelper = require('../../helpers/generate.helper');
const mailHelper = require('../../helpers/mail.helper');

// Constants
const JWT_EXPIRES = {
  REMEMBER: '30d',
  DEFAULT: '1d'
};

const COOKIE_MAX_AGE = {
  REMEMBER: 30 * 24 * 60 * 60 * 1000, // 30 days
  DEFAULT: 24 * 60 * 60 * 1000 // 1 day
};

const OTP_EXPIRE_TIME = 5 * 60 * 1000; // 5 minutes
const SALT_ROUNDS = 10;

// Helper functions
const generateToken = (account, remember = false) => {
  return jwt.sign(
    {
      id: account.id,
      email: account.email
    },
    process.env.JWT_SECRET_ADMIN,
    {
      expiresIn: remember ? JWT_EXPIRES.REMEMBER : JWT_EXPIRES.DEFAULT
    }
  );
};

const setCookie = (res, token, remember = false) => {
  res.cookie('tokenAdmin', token, {
    maxAge: remember ? COOKIE_MAX_AGE.REMEMBER : COOKIE_MAX_AGE.DEFAULT,
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

const login = (req, res) => {
  res.render('admin/pages/login', {
    titlePage: 'Đăng nhập'
  });
};

const loginPost = async (req, res) => {
  try {
    const { email, password, rememberPassword } = req.body;

    const existAccount = await AccountAdmin.findOne({ email: email })
      .select('email password status')

    if (!existAccount || !(await bcrypt.compare(password, existAccount.password))) {
      return res.status(401).json({
        code: 'error',
        message: 'Email hoặc mật khẩu không tồn tại trong hệ thống!'
      });
    }

    if (existAccount.status !== 'active') {
      return res.status(403).json({
        code: 'error',
        message: 'Tài khoản chưa được kích hoạt!'
      });
    }

    // Generate token and set cookie
    const token = generateToken(existAccount, rememberPassword);
    setCookie(res, token, rememberPassword);

    res.json({
      code: 'success',
      message: 'Đăng nhập thành công!'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

const register = (req, res) => {
  res.render('admin/pages/register', {
    titlePage: 'Đăng kí'
  });
};

const registerPost = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check existing account 
    const existAccount = await AccountAdmin.findOne({ email })
      .select('email')
      .lean();

    if (existAccount) {
      return res.status(409).json({
        code: 'error',
        message: 'Email đã tồn tại trong hệ thống!'
      });
    }

    // Hash password and create new account
    const hashedPassword = await hashPassword(password);

    await AccountAdmin.create({
      fullName,
      email,
      password: hashedPassword,
      status: 'initial'
    });

    res.status(201).json({
      code: 'success',
      message: 'Đăng ký tài khoản thành công!'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
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
  try {
    const { email } = req.body;
    // Check account existence & existing forgot password
    const [existAccount, existEmailInForgotPassword] = await Promise.all([
      AccountAdmin.findOne({ email }).select('email').lean(),
      ForgotPassword.findOne({ email }).select('email').lean()
    ]);

    if (!existAccount) {
      return res.status(404).json({
        code: 'error',
        message: 'Email không tồn tại trong hệ thống'
      });
    }

    if (existEmailInForgotPassword) {
      return res.status(429).json({
        code: 'error',
        message: 'Vui lòng gửi lại yêu cầu sau 5 phút'
      });
    }

    // Generate OTP and create record
    const otp = generateHelper.generateRandomNumber(6);
    await ForgotPassword.create({
      email,
      otp,
      expireAt: Date.now() + OTP_EXPIRE_TIME
    });

    // Send OTP email
    const subject = 'Mã OTP lấy lại mật khẩu';
    const content = `Mã OTP của bạn là <b style="color: green;">${otp}</b>. Mã OTP có hiệu lực trong 5 phút, vui lòng không cung cấp cho bất kì ai!`;
    await mailHelper.sendMail(email, subject, content);

    res.json({
      code: 'success',
      message: 'Đã gửi mã OTP qua email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

const otpPassword = (req, res) => {
  res.render('admin/pages/otp_password', {
    titlePage: 'Nhập mã OTP'
  });
};

const otpPasswordPost = async (req, res) => {
  try {
    const { otp, email } = req.body;
    // Verify OTP & Get account info
    const [existRecord, account] = await Promise.all([
      ForgotPassword.findOne({ otp, email, expireAt: { $gt: Date.now() } }).lean(),
      AccountAdmin.findOne({ email }).select('email')
    ]);

    if (!existRecord) {
      return res.status(400).json({
        code: 'error',
        message: 'Mã OTP không chính xác hoặc đã hết hạn!'
      });
    }

    if (!account) {
      return res.status(404).json({
        code: 'error',
        message: 'Tài khoản không tồn tại!'
      });
    }

    // Generate and set token
    const token = generateToken(account);
    setCookie(res, token);

    // Remove used OTP
    await ForgotPassword.deleteOne({ _id: existRecord._id });

    res.json({
      code: 'success',
      message: 'Xác thực OTP thành công!'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

const resetPassword = (req, res) => {
  res.render('admin/pages/reset_password', {
    titlePage: 'Đổi mật khẩu'
  });
};

const resetPasswordPost = async (req, res) => {
  try {
    const { password } = req.body;

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password 
    const result = await AccountAdmin.updateOne(
      {
        _id: req.account.id,
        deleted: false,
        status: 'active'
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      code: 'success',
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      code: 'error',
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
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
