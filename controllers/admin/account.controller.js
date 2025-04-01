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
const otpPassword = (req, res) => {
	res.render("admin/pages/otp_password", {
		titlePage: "Nhập mã OTP",
	});
};
const resetPassword = (req, res) => {
	res.render("admin/pages/reset_password", {
		titlePage: "Đổi mật khẩu",
	});
};

module.exports = {
	login,
	register,
	forgotPassword,
	otpPassword,
	resetPassword,
};
