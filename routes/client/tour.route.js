const router = require("express").Router();

const tourController = require("../../controllers/client/tour.controller");

router.get("/", tourController.list);
router.get("/del", tourController.del);
router.get("/create", tourController.create);

module.exports = router;
