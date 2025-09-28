const router = require('express').Router();

const contactController = require('../../controllers/client/contact.controller.js');

router.get('/', contactController.contact);

router.post('/create', contactController.createPost);

router.post("/feedback", contactController.feedbackPost);

module.exports = router;
