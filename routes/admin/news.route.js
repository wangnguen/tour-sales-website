const router = require('express').Router();
const multer = require('multer');

const newsController = require('../../controllers/admin/news.controller');
const newsValidate = require('../../validates/admin/news.validate');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/list', newsController.list);

router.get('/create', newsController.create);

router.post('/create', upload.single('avatar'), newsValidate.createPost, newsController.createPost);

router.get('/edit/:id', newsController.edit);

router.patch('/edit/:id', upload.single('avatar'), newsValidate.createPost, newsController.editPatch);

router.patch('/delete/:id', newsController.deletePatch);

router.patch('/change-multi', newsController.changeMultiPatch);

router.get('/trash', newsController.trash);

router.patch('/trash/change-multi', newsController.trashChangeMultiPatch);

router.patch('/undo/:id', newsController.undoPatch);

router.patch('/delete-destroy/:id', newsController.deleteDestroy);

module.exports = router;
