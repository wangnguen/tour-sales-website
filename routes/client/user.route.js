const router = require('express').Router();
const multer = require('multer');

const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

const userController = require('../../controllers/client/user.controller');
router.get('/profile', userController.profile);

router.get('/profile/edit', userController.userProfileEdit);

router.get('/profile/change-password', userController.userProfileChangePassword);

router.patch('/profile/edit', upload.single('avatar'), userController.userProfileEditPatch);

router.patch('/profile/change-password', userController.userProfileChangePasswordPatch);

module.exports = router;
