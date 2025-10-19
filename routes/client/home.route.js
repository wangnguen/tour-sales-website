const router = require('express').Router();

const homeController = require('../../controllers/client/home.controller');

router.get('/', homeController.homeController);

module.exports = router;
