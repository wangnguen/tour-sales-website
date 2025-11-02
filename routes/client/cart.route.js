const router = require('express').Router();

const cartController = require('../../controllers/client/cart.controller');
const { verifyToken } = require('../../middlewares/client/authUser.middleware');

router.get('/', verifyToken, cartController.cart);

router.post('/detail', cartController.detail);

module.exports = router;
