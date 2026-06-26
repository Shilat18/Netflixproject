const express = require('express');
const homeController = require('../controllers/homeController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected home and content routes.
router.get('/homepage', requireLogin, homeController.showHomepage);
router.get('/content/:id', requireLogin, homeController.showContentDetails);

module.exports = router;
