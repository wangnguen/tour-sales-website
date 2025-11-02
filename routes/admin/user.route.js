const router = require('express').Router();

const userController = require('../../controllers/admin/user.controller');

router.get('/list', userController.list);

router.patch('/delete/:id', userController.deletePatch);

router.patch('/change-multi', userController.changeMultiPatch);

module.exports = router;
