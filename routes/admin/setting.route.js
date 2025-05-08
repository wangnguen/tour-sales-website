const router = require("express").Router();
const multer = require("multer");

const settingController = require("../../controllers/admin/setting.controller");
const settingValidate = require("../../validates/admin/setting.validate");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", settingController.list);

router.get("/website_info", settingController.websiteInfo);

router.patch(
	"/website_info",
	upload.fields([
		{ name: "logo", maxCount: 1 },
		{ name: "favicon", maxCount: 1 },
	]),
	settingValidate.websiteInfoPatch,
	settingController.websiteInfoPatch,
);

router.get("/account_admin/list", settingController.accountAdminList);

router.get("/account_admin/create", settingController.accountAdminCreate);
router.post(
	"/account_admin/create",
	upload.single("avatar"),
	settingValidate.accountAdminCreatePost,
	settingController.accountAdminCreatePost,
);

router.get("/account_admin/edit/:id", settingController.accountAdminEdit);

router.patch(
	"/account_admin/edit/:id",
	upload.single("avatar"),
	settingValidate.accountAdminCreatePost,
	settingController.accountAdminEditPatch,
);

router.get("/role/list", settingController.roleList);

router.get("/role/create", settingController.roleCreate);

router.post(
	"/role/create",
	settingValidate.roleCreatePost,
	settingController.roleCreatePost,
);

router.get("/role/edit/:id", settingController.roleEdit);

router.patch(
	"/role/edit/:id",
	settingValidate.roleCreatePost,
	settingController.roleEditPatch,
);

router.patch("/change-multi", settingController.changeMultiPatch);

module.exports = router;
