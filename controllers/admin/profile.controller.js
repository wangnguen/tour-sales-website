const profileEdit = (req, res) => {
	res.render("admin/pages/profile_edit", {
		titlePage: "Thông tin cá nhân",
	});
};
const profileChangePassword = (req, res) => {
	res.render("admin/pages/profile_change_password", {
		titlePage: "Đổi mật khẩu",
	});
};

module.exports = {
	profileEdit,
	profileChangePassword,
};
