const router = require('express').Router();
const multer = require('multer');

const categoryValidate = require('../../validates/admin/category.validate');

const categoryController = require('../../controllers/admin/category.controller');

const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/list', categoryController.list);

router.get('/create', categoryController.create);

router.post('/create', upload.single('avatar'), categoryValidate.createPost, categoryController.createPost);

router.get('/edit/:id', categoryController.edit);

router.patch('/edit/:id', upload.single('avatar'), categoryValidate.createPost, categoryController.editPatch);

router.patch('/delete/:id', categoryController.deletePatch);

router.patch('/change-multi', categoryController.changeMultiPatch);

router.get('/trash', categoryController.trash);

router.patch('/trash/change-multi', categoryController.trashChangeMultiPatch);

router.patch('/undo/:id', categoryController.undoPatch);

router.patch('/delete-destroy/:id', categoryController.deleteDestroyPatch);

module.exports = router;
