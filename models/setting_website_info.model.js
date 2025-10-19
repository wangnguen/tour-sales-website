const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  websiteName: String,
  phone: String,
  email: String,
  address: String,
  logo: String,
  favicon: String
});

const SettingWebsiteInfo = mongoose.model('SettingWebsiteInfo', schema, 'setting_website_info');

module.exports = SettingWebsiteInfo;
