const router = require('express').Router();
const tourRoutes = require('./tour.route');
const homeRoutes = require('./home.route');
const cartRoutes = require('./cart.route');
const contactRoutes = require('./contact.route');
const categoryRoutes = require('./category.route');
const searchRoutes = require('./search.route');
const orderRoutes = require('./order.route');
const newRoutes = require('./news.route');
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');

const settingMiddleware = require('../../middlewares/client/setting.middleware');
const categoryMiddleware = require('../../middlewares/client/category.middleware');
const authUserMiddleware = require('../../middlewares/client/authUser.middleware');

router.use(settingMiddleware.websiteInfo);
router.use(categoryMiddleware.list);

router.use(authUserMiddleware.attachUser);
router.use('/', homeRoutes);
router.use('/tour', tourRoutes);
router.use('/cart', cartRoutes);
router.use('/contact', contactRoutes);
router.use('/category', categoryRoutes);
router.use('/search', searchRoutes);
router.use('/order', orderRoutes);
router.use('/news', newRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

router.get('*', (req, res) => {
  res.render('client/pages/error_404.pug', {
    titlePage: '404 Not Found'
  });
});

module.exports = router;
