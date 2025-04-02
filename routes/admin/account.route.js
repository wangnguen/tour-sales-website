const router = require("express").Router();

const accountController = require("../../controllers/admin/account.controller");

router.get("/login", accountController.login);

router.get("/register", accountController.register);

router.post("/register", accountController.registerPost);

router.get("/register-initial", accountController.registerInitial);

router.get("/forgot_password", accountController.forgotPassword);

router.get("/otp_password", accountController.otpPassword);

router.get("/reset_password", accountController.resetPassword);

module.exports = router;
