const router = require("express").Router();

const accountRoutes = require("./account.route");
const dashboardRoutes = require("./dashboard.route");
const categoryRoutes = require("./category.route");
const tourRoutes = require("./tour.route");
const orderRoutes = require("./order.route");

router.use("/account", accountRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/category", categoryRoutes);
router.use("/tour", tourRoutes);
router.use("/order", orderRoutes);

module.exports = router;
