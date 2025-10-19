const Joi = require('joi');

const registerPost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().required().min(5).max(50).messages({
      'string.empty': 'Vui lòng nhập họ tên',
      'string.min': 'Họ tên phải có ít nhất 5 ký tự!',
      'string.max': 'Họ tên không được vượt quá 50 ký tự!'
    }),
    email: Joi.string().required().email().messages({
      'string.empty': 'Vui lòng nhập email',
      'string.email': 'Email không đúng định dạng!'
    }),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/\d/.test(value)) {
          return helpers.error('password.digit');
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu',
        'string.min': 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        'password.uppercase': 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        'password.lowercase': 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        'password.digit': 'Mật khẩu phải chứa ít nhất một chữ số!',
        'password.special': 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    // console.log(error);
    res.json({
      code: 'error',
      message: errorMessage
    });
    return;
  }

  next();
};

const loginPost = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required().email().messages({
      'string.empty': 'Vui lòng nhập email',
      'string.email': 'Email không đúng định dạng!'
    }),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/\d/.test(value)) {
          return helpers.error('password.digit');
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu',
        'string.min': 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        'password.uppercase': 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        'password.lowercase': 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        'password.digit': 'Mật khẩu phải chứa ít nhất một chữ số!',
        'password.special': 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      }),
    rememberPassword: Joi.boolean()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    // console.log(error);
    res.json({
      code: 'error',
      message: errorMessage
    });
    return;
  }

  next();
};

const forgotPasswordPost = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Vui lòng nhập email của bạn!',
      'string.email': 'Email không đúng định dạng!'
    })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    // console.log(error);
    res.json({
      code: 'error',
      message: errorMessage
    });
    return;
  }

  next();
};

const otpPost = (req, res, next) => {
  const schema = Joi.object({
    otp: Joi.string().min(6).required().messages({
      'string.empty': 'Vui lòng nhập mã OTP!',
      'string.min': 'Mã OTP phải chứa ít nhất 6 ký tự!'
    }),
    email: Joi.string()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    // console.log(error);
    res.json({
      code: 'error',
      message: errorMessage
    });
    return;
  }

  next();
};

const resetPasswordPost = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/\d/.test(value)) {
          return helpers.error('password.digit');
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu',
        'string.min': 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        'password.uppercase': 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        'password.lowercase': 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        'password.digit': 'Mật khẩu phải chứa ít nhất một chữ số!',
        'password.special': 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Mật khẩu xác nhận không khớp!',
      'any.required': 'Vui lòng xác nhận mật khẩu!'
    })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    // console.log(error);
    res.json({
      code: 'error',
      message: errorMessage
    });
    return;
  }

  next();
};

module.exports = {
  registerPost,
  loginPost,
  forgotPasswordPost,
  otpPost,
  resetPasswordPost
};
