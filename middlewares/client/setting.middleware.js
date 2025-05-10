const SettingWebsiteInfo = require("../../models/setting_website_info.model");

const websiteInfo = async (req, res, next) => {
	const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

	res.locals.settingWebsiteInfo = settingWebsiteInfo;

	next();
};
module.exports = { websiteInfo };
