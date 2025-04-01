const router = require("express").Router();

const settingController = require("../../controllers/admin/setting.controller");

router.get("/list", settingController.list);

router.get("/website_info", settingController.websiteInfo);

router.get("/account_admin/list", settingController.accountAdminList);

router.get("/account_admin/create", settingController.accountAdminCreate);

router.get("/role/list", settingController.roleList);
router.get("/role/create", settingController.roleCreate);

module.exports = router;
