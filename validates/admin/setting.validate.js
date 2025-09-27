const Joi = require('joi');

const websiteInfoPatch = (req, res, next) => {
  const schema = Joi.object({
    websiteName: Joi.string().required().messages({
      'string.empty': 'Vui lòng nhập tên website!'
    }),
    email: Joi.string().email().messages({
      'string.empty': 'Vui lòng nhập email',
      'string.email': 'Email không đúng định dạng!'
    }),

    phone: Joi.string().allow(''),
    address: Joi.string().allow(''),
    logo: Joi.string().allow(''),
    favicon: Joi.string().allow('')
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

const accountAdminCreatePost = (req, res, next) => {
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
    phone: Joi.string().allow(''),
    positionCompany: Joi.string().allow(''),
    password: Joi.string().allow(''),
    role: Joi.string().allow(''),
    status: Joi.string().allow(''),
    avatar: Joi.string().allow('')
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

const roleCreatePost = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Vui lòng nhập tên nhóm quyền!'
    }),
    description: Joi.string().allow(''),
    permissions: Joi.array().optional()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;

    res.json({
      code: 'error',
      message: errorMessage
    });
    return;
  }
  next();
};

module.exports = {
  websiteInfoPatch,
  accountAdminCreatePost,
  roleCreatePost
};
