const AccountAdmin = require("../../models/admin_account.model");

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

const registerPost = async (req, res) => {
	const { fullName, email, password } = req.body;

	const existAccount = await AccountAdmin.findOne({
		email: email,
	});

	if (existAccount) {
		res.json({
			code: "error",
			message: "Email already exists in the system",
		});
		return; // dung chuong trinh
	}

	const newAccount = new AccountAdmin({
		fullName: fullName,
		email: email,
		password: password,
		status: "initial",
	});

	await newAccount.save();

	//res.json js -> json: express
	res.json({
		code: "success",
		message: "Đăng ký tài khoản thành công !",
	});
};

const registerInitial = (req, res) => {
	res.render("admin/pages/register_initial", {
		titlePage: "Tài khoản đã được khởi tạo",
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
	registerPost,
	registerInitial,
	forgotPassword,
	otpPassword,
	resetPassword,
};
