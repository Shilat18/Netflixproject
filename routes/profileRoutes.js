const express = require('express');
const profileController = require('../controllers/profileController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected profile routes.
router.get('/profiles', requireLogin, profileController.showProfiles);
router.post('/profiles/add', requireLogin, profileController.addProfile);

module.exports = router;
