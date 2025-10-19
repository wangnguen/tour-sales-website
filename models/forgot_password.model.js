const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expireAt: {
      type: Date,
      expires: 0
    }
  },
  {
    timestamps: true // tu dong sinh ra truomg createdAt va updateAt
  }
);

const ForgotPassword = mongoose.model('ForgotPasswod', schema, 'forgot_password');

module.exports = ForgotPassword;
