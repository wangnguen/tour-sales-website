const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema(
  {
    name: String,
    avatar: String,
    position: Number,
    status: String,
    description: String,
    createdBy: String,
    updatedBy: String,
    content: String,
    slug: {
      type: String,
      slug: 'name',
      unique: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    deletedBy: String,
    deletedAt: Date
  },
  {
    timestamps: true // Tự động sinh ra trường createdAt và updatedAt
  }
);

const News = mongoose.model('News', schema, 'news');

module.exports = News;
