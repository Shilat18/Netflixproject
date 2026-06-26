const express = require('express');
const adminController = require('../controllers/adminController');
const { requireLogin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin-only routes.
router.get('/admin/users', requireLogin, requireAdmin, adminController.showUsers);

module.exports = router;
