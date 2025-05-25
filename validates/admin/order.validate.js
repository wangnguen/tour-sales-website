const Joi = require('joi');

module.exports.editPatch = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().required().min(5).max(50).messages({
      'string.empty': 'Vui lòng nhập họ tên',
      'string.min': 'Họ tên phải có ít nhất 5 ký tự!',
      'string.max': 'Họ tên không được vượt quá 50 ký tự!'
    }),
    phone: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(value)) {
          return helpers.error('password.incorrectFormat');
        }
        return value;
      })
      .messages({
        'string.empty': 'Vui lòng nhập số điện thoại!',
        'password.incorrectFormat': 'Số điện thoại không đúng định dạng!'
      }),
    note: Joi.string().allow(''),
    paymentMethod: Joi.string().allow(''),
    paymentStatus: Joi.string().allow(''),
    status: Joi.string().allow('')
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
