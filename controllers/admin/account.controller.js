const login = (req, res) => {
	res.render("admin/pages/login", {
		titlePage: "Đăng nhập",
	});
};

const register = (req, res) => {
	res.render("admin/pages/register", {
		titlePage: "Đăng kí",
	});
};
const forgotPassword = (req, res) => {
	res.render("admin/pages/forgot_password", {
		titlePage: "Quên mật khẩu",
	});
};

module.exports = { login, register, forgotPassword };
