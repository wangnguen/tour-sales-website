const router = require("express").Router();

const contactController = require("../../controllers/client/contact.controller.js");

router.post("/create", contactController.createPost);

module.exports = router;
