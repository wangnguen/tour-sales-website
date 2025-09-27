const userController = require('../../controllers/client/user.controller');

const router = require('express').Router();

router.get('/login', userController.login);

router.get('/register', userController.register);

router.get('/register-initial', userController.registerInitial);

router.get('/forgot_password', userController.forgotPassword);

router.get('/otp_password', userController.otpPassword);

router.get('/reset_password', userController.resetPassword);

module.exports = router;
