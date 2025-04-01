const router = require("express").Router();

const profileController = require("../../controllers/admin/profile.controller");

router.get("/edit", profileController.profileEdit);
router.get("/change_password", profileController.profileChangePassword);

module.exports = router;
