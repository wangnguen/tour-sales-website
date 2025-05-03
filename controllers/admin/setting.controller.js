const SettingWebsiteInfo = require("../../models/setting_website_info.model");

const list = (req, res) => {
	res.render("admin/pages/setting_list", {
		titlePage: "Cài đặt chung",
	});
};
const websiteInfo = async (req, res) => {
	const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

	res.render("admin/pages/setting_website_info", {
		titlePage: "Thông tin website",
		settingWebsiteInfo: settingWebsiteInfo,
	});
};

const websiteInfoPatch = async (req, res) => {
	if (req.files && req.files.logo) {
		req.body.logo = req.files.logo[0].path;
	} else {
		delete req.body.logo;
	}

	if (req.files && req.files.favicon) {
		req.body.favicon = req.files.favicon[0].path;
	} else {
		delete req.body.favicon;
	}

	const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
	if (settingWebsiteInfo) {
		await SettingWebsiteInfo.updateOne(
			{
				_id: settingWebsiteInfo.id,
			},
			req.body,
		);
	} else {
		const newRecord = new SettingWebsiteInfo(req.body);
		await newRecord.save();
	}

	req.flash("success", "Cập nhật thành công!");

	res.json({
		code: "success",
	});
};

const accountAdminList = (req, res) => {
	res.render("admin/pages/setting_account_admin_list", {
		titlePage: "Tài khoản quản trị",
	});
};
const accountAdminCreate = (req, res) => {
	res.render("admin/pages/setting_account_admin_create", {
		titlePage: "Tạo tài khoản quản trị",
	});
};
const roleList = (req, res) => {
	res.render("admin/pages/setting_role_list", {
		titlePage: "Nhóm quyền",
	});
};
const roleCreate = (req, res) => {
	res.render("admin/pages/setting_role_create", {
		titlePage: "Tạo nhóm quyền",
	});
};

module.exports = {
	list,
	websiteInfo,
	websiteInfoPatch,
	accountAdminList,
	accountAdminCreate,
	roleList,
	roleCreate,
};
