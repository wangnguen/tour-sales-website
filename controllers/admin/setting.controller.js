const SettingWebsiteInfo = require("../../models/setting_website_info.model");
const Role = require("../../models/role.model");

const permissionConfig = require("../../configs/permission");

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
const roleList = async (req, res) => {
	const roleList = await Role.find({
		deleted: false,
	});

	res.render("admin/pages/setting_role_list", {
		titlePage: "Nhóm quyền",
		roleList: roleList,
	});
};

const roleCreate = (req, res) => {
	res.render("admin/pages/setting_role_create", {
		titlePage: "Tạo nhóm quyền",
		permissionList: permissionConfig.permissionList,
	});
};
const roleCreatePost = async (req, res) => {
	req.body.createdBy = req.account.id;
	req.body.updatedBy = req.account.id;

	const newRecord = new Role(req.body);
	await newRecord.save();
	req.flash("success", "Tạo nhóm quyền thành công !");

	res.json({
		code: "success",
	});
};

const roleEdit = async (req, res) => {
	try {
		const id = req.params.id;
		const roleDetail = await Role.findOne({
			_id: id,
			deleted: false,
		});

		if (roleDetail) {
			res.render("admin/pages/setting_role_edit", {
				titlePage: "Chỉnh sửa nhóm quyền",
				permissionList: permissionConfig.permissionList,
				roleDetail: roleDetail,
			});
		} else {
			res.redirect(`$/{pathAdmin}/setting/role/list`);
		}
	} catch (error) {
		res.redirect(`$/{pathAdmin}/setting/role/list`);
	}
};

const roleEditPatch = async (req, res) => {
	try {
		const id = req.params.id;
		console.log(id);
		req.body.updatedBy = req.account.id;

		await Role.updateOne(
			{
				_id: id,
				deleted: false,
			},
			req.body,
		);
		req.flash("success", "Cập nhật nhóm quyền thành công !");

		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id không tồn tại",
		});
	}
};
module.exports = {
	list,
	websiteInfo,
	websiteInfoPatch,
	accountAdminList,
	accountAdminCreate,
	roleList,
	roleCreate,
	roleCreatePost,
	roleEdit,
	roleEditPatch,
};
