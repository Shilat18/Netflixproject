const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication routes.
router.get('/', authController.showLoginPage);
router.post('/login', authController.login);
router.get('/signup', authController.showSignupPage);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

module.exports = router;
