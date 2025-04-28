const router = require("express").Router();
const multer = require("multer");

const tourController = require("../../controllers/admin/tour.controller");

const tourValidate = require("../../validates/admin/tour.validate");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", tourController.list);

router.get("/create", tourController.create);

router.post(
	"/create",
	upload.single("avatar"),
	tourValidate.createPost,
	tourController.createPost,
);

router.get("/edit/:id", tourController.edit);

router.patch(
	"/edit/:id",
	upload.single("avatar"),
	tourValidate.createPost,
	tourController.editPatch,
);

router.get("/trash", tourController.trash);

module.exports = router;
