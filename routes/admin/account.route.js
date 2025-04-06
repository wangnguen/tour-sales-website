const router = require("express").Router();

const accountController = require("../../controllers/admin/account.controller");

const accountValidate = require("../../validates/admin/account.validate");

router.get("/login", accountController.login);

router.post("/login", accountValidate.loginPost, accountController.loginPost);

router.get("/register", accountController.register);

router.post(
	"/register",
	accountValidate.registerPost,
	accountController.registerPost,
);

router.get("/register-initial", accountController.registerInitial);

router.get("/forgot_password", accountController.forgotPassword);

router.get("/otp_password", accountController.otpPassword);

router.get("/reset_password", accountController.resetPassword);

router.post("/logout", accountController.logoutPost);

module.exports = router;
