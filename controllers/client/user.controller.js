const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateHelper = require('../../helpers/generate.helper');
const mailHelper = require('../../helpers/mail.helper');

const ForgotPassword = require('../../models/forgot_password.model');
const User = require('../../models/user.model');

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
  const { fullName, email, password } = req.body;

  const existAccount = await User.findOne({
    email: email
  });

  if (existAccount) {
    res.json({
      code: 'error',
      message: 'Tài khoản đã tồn tại trong hệ thống!'
    });
    return;
  }

  // Mã hoá mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = new User({
    fullName: fullName,
    email: email,
    password: hashedPassword,
    status: 'initial'
  });

  await newAccount.save();

  res.json({
    code: 'success',
    message: 'Đăng ký tài khoản thành công !'
  });
};

const loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  const existAccount = await User.findOne({ email: email });

  if (!existAccount) {
    res.json({
      code: 'error',
      message: 'Tài khoản không tồn tại trong hệ thống !'
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, existAccount.password);

  if (!isPasswordValid) {
    res.json({
      code: 'error',
      message: 'Mật khẩu không chính xác !'
    });
    return;
  }

  if (existAccount.status != 'active') {
    res.json({
      code: 'error',
      message: 'Tài khoản chưa được kích hoạt !'
    });
    return;
  }

  // Tạo JWT
  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword ? '30d' : '1d'
    }
  );

  // Lưu token vào cookie
  res.cookie('token', token, {
    maxAge: rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  });

  res.json({
    code: 'success',
    message: 'Đăng nhập thành công !'
  });
};

const forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  // ktra email co ton tai hay khong
  const existAccount = await User.findOne({ email: email });
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
      message: 'Vui lòng gửi lại yêu cầu sau 3 phút'
    });
    return;
  }

  // tao ma otp
  const otp = generateHelper.generateRandomNumber(6);
  // luu vao db: email va otp, sau 3p tu dong xoa
  const newRecord = new ForgotPassword({
    email: email,
    otp: otp,
    expireAt: 3 * 60 * 1000 + Date.now()
  });
  await newRecord.save();

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
    message: 'Đã gửi mã otp qua email'
  });
};

const otpPasswordPost = async (req, res) => {
  const { otp, email } = req.body;

  // kiem tra co ton tai ban ghi trong ForgotPassword ko ?
  const existRecord = await ForgotPassword.findOne({ otp, email });

  if (!existRecord) {
    res.json({
      code: 'error',
      message: 'Mã OTP không chính xác!'
    });
    return;
  }
  // tim thong tin User
  const account = await User.findOne({
    email
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

const resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  // Mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.updateOne(
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
    message: 'Đổi mật khẩu thành công !'
  });
};

const logoutPost = async (req, res) => {
  res.clearCookie('token');
  res.json({
    code: 'success',
    message: 'Đăng xuất thành công !'
  });
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
  logoutPost
};
