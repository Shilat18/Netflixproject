const express = require('express');
const adminController = require('../controllers/adminController');
const { requireLogin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin-only routes.
router.get(
    '/admin/users',
    requireLogin,
    requireAdmin,
    adminController.showUsers
);

router.post(
    '/admin/users/add',
    requireLogin,
    requireAdmin,
    adminController.addUser
);

router.get(
    '/admin/content',
    requireLogin,
    requireAdmin,
    adminController.showContentManager
);

router.post(
    '/admin/content/add',
    requireLogin,
    requireAdmin,
    adminController.addContent
);

router.get(
    '/admin/content/:id/edit',
    requireLogin,
    requireAdmin,
    adminController.showEditContent
);

router.post(
    '/admin/content/:id/update',
    requireLogin,
    requireAdmin,
    adminController.updateContent
);

router.post(
    '/admin/content/:id/delete',
    requireLogin,
    requireAdmin,
    adminController.deleteContent
);

router.get(
    '/admin/statistics',
    requireLogin,
    requireAdmin,
    adminController.showStatistics
);

module.exports = router;
