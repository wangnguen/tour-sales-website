const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateHelper = require('../../helpers/generate.helper');
const mailHelper = require('../../helpers/mail.helper');

const ForgotPassword = require('../../models/forgot_password.model');
const User = require('../../models/user.model');

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
    process.env.JWT_SECRET,
    {
      expiresIn: remember ? JWT_EXPIRES.REMEMBER : JWT_EXPIRES.DEFAULT
    }
  );
};

const setCookie = (res, token, remember = false) => {
  res.cookie('token', token, {
    maxAge: remember ? COOKIE_MAX_AGE.REMEMBER : COOKIE_MAX_AGE.DEFAULT,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development'
  });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

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

const registerPost = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check existing account
    const existAccount = await User.findOne({ email }).select('email').lean();

    if (existAccount) {
      return res.status(409).json({
        code: 'error',
        message: 'Email đã tồn tại trong hệ thống!'
      });
    }

    // Hash password and create new account
    const hashedPassword = await hashPassword(password);

    // Link xác thực
    // Tạo token xác thực có hạn 15 phút
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const verifyLink =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/auth/verify?token=${token}`
        : `${process.env.DOMAIN_WEBSITE}/auth/verify?token=${token}`;

    // Xác nhận người dùng
    // Chủ đề email
    const subject = '✅ Xác nhận đăng ký tài khoản của bạn';

    // Nội dung email HTML
    const content = `
  <div style="max-width: 520px; margin: auto; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fb; border-radius: 10px; border: 1px solid #e0e0e0; padding: 20px;">
    <div style="text-align: center;">
      <h2 style="color: #2e86de; margin-bottom: 8px;">Chào mừng bạn đến với hệ thống 🎉</h2>
      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        Cảm ơn bạn đã đăng ký tài khoản.<br>
        Vui lòng xác nhận email của bạn bằng cách nhấn vào nút bên dưới:
      </p>

      <div style="margin: 25px 0;">
        <a href="${verifyLink}" 
          style="display: inline-block;
                  background: linear-gradient(45deg, #2e86de, #00b894);
                  color: #fff;
                  font-weight: bold;
                  text-decoration: none;
                  padding: 12px 28px;
                  border-radius: 8px;
                  letter-spacing: 1px;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
                  transition: all 0.2s;">
          XÁC NHẬN NGAY
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        ⏳ Link xác nhận có hiệu lực trong <b style="color:#e74c3c;">15 phút</b>.<br>
        Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

      <p style="font-size: 12px; color: #aaa;">
        Đây là email tự động, vui lòng không trả lời lại.<br>
        © ${new Date().getFullYear()} Hệ thống của bạn. Mọi quyền được bảo lưu.
      </p>
    </div>
  </div>
`;

    // Gửi mail
    mailHelper.sendMail(email, subject, content);

    // Tạo tài khoản
    await User.create({
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

const loginPost = async (req, res) => {
  try {
    const { email, password, rememberPassword } = req.body;

    const existAccount = await User.findOne({ email: email }).select('email password status');

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

const forgotPasswordPost = async (req, res) => {
  try {
    const { email } = req.body;
    // Check account existence & existing forgot password
    const [existAccount, existEmailInForgotPassword] = await Promise.all([
      User.findOne({ email }).select('email').lean(),
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
    // gui ma otp qua email cho ng dung
    const subject = `🔐 Mã OTP lấy lại mật khẩu`;

    const content = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f6f9; border-radius: 10px; border: 1px solid #ddd;">
    <h2 style="color: #4CAF50; text-align: center;">Xác thực tài khoản</h2>
    <p style="font-size: 16px; color: #333;">
      Xin chào 👋,<br>
      Bạn vừa yêu cầu đặt lại mật khẩu. Đây là mã OTP của bạn:
    </p>
    <div style="margin: 20px auto; text-align: center;">
      <span style="
        display: inline-block;
        font-size: 28px;
        font-weight: bold;
        color: white;
        background: linear-gradient(45deg, #4CAF50, #2196F3);
        padding: 12px 25px;
        border-radius: 8px;
        letter-spacing: 3px;
      ">
        ${otp}
      </span>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">
      ⏳ Mã OTP có hiệu lực trong <b style="color:#e74c3c;">3 phút</b>.<br>
      ❌ Vui lòng <b>không cung cấp</b> mã này cho bất kỳ ai!
    </p>
    <hr style="margin: 25px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Đây là email tự động, vui lòng không trả lời lại.
    </p>
  </div>
`;
    mailHelper.sendMail(email, subject, content);

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

const otpPasswordPost = async (req, res) => {
  try {
    const { otp, email } = req.body;
    // Verify OTP & Get account info
    const [existRecord, account] = await Promise.all([
      ForgotPassword.findOne({ otp, email, expireAt: { $gt: Date.now() } }).lean(),
      User.findOne({ email }).select('email')
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

const resetPasswordPost = async (req, res) => {
  try {
    const { password } = req.body;

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password
    const result = await User.updateOne(
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
    message: 'Đăng xuất thành công !'
  });
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user || user.status === 'active') return res.render('client/pages/verify_result', { success: false });

    user.status = 'active';
    await user.save();

    res.render('client/pages/verify_result', { success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Link không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = {
  login,
  register,
  registerInitial,
  forgotPassword,
  otpPassword,
  resetPassword,
  registerPost,
  loginPost,
  forgotPasswordPost,
  otpPasswordPost,
  resetPasswordPost,
  logoutPost,
  verifyEmail
};
