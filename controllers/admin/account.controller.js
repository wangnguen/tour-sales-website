const login = (req, res) => {
	res.render("admin/pages/login", {
		titlePage: "Đăng nhập",
	});
};
module.exports = { login };
