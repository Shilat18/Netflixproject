const express = require('express');
const homeController = require('../controllers/homeController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected home and content routes.
router.get('/homepage.html', requireLogin, (req, res) => res.redirect('/homepage'));
router.get('/homepage', requireLogin, homeController.showHomepage);
router.get('/content/:id', requireLogin, homeController.showContentDetails);
// Review form submission for a specific movie.
router.post('/content/:id/reviews', requireLogin, homeController.addMovieReview);

module.exports = router;
