const userController = require('../../controllers/client/user.controller');
const userValidate = require('../../validates/client/user.validate');
const authUserMiddleware = require('../../middlewares/client/authUser.middleware');

const router = require('express').Router();

router.get('/login', userController.login);

router.get('/register', userController.register);

router.get('/register-initial', userController.registerInitial);

router.get('/forgot_password', userController.forgotPassword);

router.get('/otp_password', userController.otpPassword);

router.get('/reset_password', userController.resetPassword);

router.post('/register', userValidate.registerPost, userController.registerPost);

router.post('/login', userValidate.loginPost, userController.loginPost);

router.post('/forgot_password', userValidate.forgotPasswordPost, userController.forgotPasswordPost);

router.post('/otp_password', userValidate.otpPost, userController.otpPasswordPost);

router.post(
  '/reset_password',
  authUserMiddleware.verifyToken,
  userValidate.resetPasswordPost,
  userController.resetPasswordPost
);

router.post('/logout', userController.logoutPost);

module.exports = router;
