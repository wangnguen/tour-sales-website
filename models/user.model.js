const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    status: String,
    password: String,
    avatar: String,
    adddress: String,
    createdBy: String,
    updatedBy: String,
    deleted: {
      type: Boolean,
      default: false
    },
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true // Tự động sinh ra trường createdAt và updatedAt
  }
);

const User = mongoose.model('User', schema, 'users');

module.exports = User;
