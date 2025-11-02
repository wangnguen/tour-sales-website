const authController = require('../../controllers/client/auth.controller');
const userValidate = require('../../validates/client/user.validate');
const authUserMiddleware = require('../../middlewares/client/authUser.middleware');

const router = require('express').Router();

router.get('/login', authController.login);

router.get('/register', authController.register);

router.get('/register-initial', authController.registerInitial);

router.get('/forgot_password', authController.forgotPassword);

router.get('/otp_password', authController.otpPassword);

router.get('/reset_password', authController.resetPassword);

router.post('/register', userValidate.registerPost, authController.registerPost);

router.post('/login', userValidate.loginPost, authController.loginPost);

router.post('/forgot_password', userValidate.forgotPasswordPost, authController.forgotPasswordPost);

router.post('/otp_password', userValidate.otpPost, authController.otpPasswordPost);

router.post(
  '/reset_password',
  authUserMiddleware.verifyToken,
  userValidate.resetPasswordPost,
  authController.resetPasswordPost
);

router.post('/logout', authController.logoutPost);

router.get('/verify', authController.verifyEmail);

module.exports = router;
