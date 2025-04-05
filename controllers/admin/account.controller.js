const AccountAdmin = require("../../models/admin_account.model");

const bcrypt = require("bcryptjs");

const login = (req, res) => {
	res.render("admin/pages/login", {
		titlePage: "Đăng nhập",
	});
};

const loginPost = async (req, res) => {
	const { email, password } = req.body;
	const existAccount = await AccountAdmin.findOne({ email: email });

	if (!existAccount) {
		res.json({
			code: "error",
			message: "Email does not exist in the system !",
		});
		return; // dung chuong trinh
	}

	const isPasswordValid = await bcrypt.compare(password, existAccount.password);

	if (!isPasswordValid) {
		res.json({
			code: "error",
			message: "Incorrect password !",
		});
		return;
	}

	if (existAccount.status != "active") {
		res.json({
			code: "error",
			message: "Account not activated !",
		});
		return;
	}

	//res.json js -> json: express
	res.json({
		code: "success",
		message: "Account login successful !",
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

	// Mã hoá mật khẩu
	const salt = await bcrypt.genSalt(10); // Tạo ra chuỗi ngẫu nhiên có 10 ký
	const hashedPassword = await bcrypt.hash(password, salt);

	const newAccount = new AccountAdmin({
		fullName: fullName,
		email: email,
		password: hashedPassword,
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
	loginPost,
	register,
	registerPost,
	registerInitial,
	forgotPassword,
	otpPassword,
	resetPassword,
};
