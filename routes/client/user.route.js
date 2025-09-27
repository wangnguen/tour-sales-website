const router = require('express').Router();

const userController = require('../../controllers/client/user.controller');
router.get('/profile', userController.profile);

router.get('/edit', userController.userProfileEdit);

router.get('/change_password', userController.userProfileChangePassword);

module.exports = router;
