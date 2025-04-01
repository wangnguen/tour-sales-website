const list = (req, res) => {
	res.render("admin/pages/setting_list", {
		titlePage: "Cài đặt chung",
	});
};
const websiteInfo = (req, res) => {
	res.render("admin/pages/setting_website_info", {
		titlePage: "Thông tin website",
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
	accountAdminList,
	accountAdminCreate,
	roleList,
	roleCreate,
};
