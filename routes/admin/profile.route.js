const router = require('express').Router();
const multer = require('multer');

const profileController = require('../../controllers/admin/profile.controller');

const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/edit', profileController.profileEdit);

router.patch('/edit', upload.single('avatar'), profileController.profileEditPatch);

router.get('/change_password', profileController.profileChangePassword);

router.patch('/change-password', profileController.profileChangePasswordPatch);

module.exports = router;
