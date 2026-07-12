const express = require('express');

const homeController =
    require('../controllers/homeController');

const {
    requireLogin
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/homepage.html',
    requireLogin,
    function (req, res) {
        res.redirect('/homepage');
    }
);

router.get(
    '/homepage',
    requireLogin,
    homeController.showHomepage
);

router.get(
    '/my-list',
    requireLogin,
    homeController.showMyList
);

router.post(
    '/my-list/:id/toggle',
    requireLogin,
    homeController.toggleMyList
);

router.get(
    '/watch/:id',
    requireLogin,
    homeController.showWatchPage
);

// זה ה־Route שמקבל ושומר את זמן הצפייה
router.post(
    '/watch/:id/progress',
    requireLogin,
    homeController.saveWatchProgress
);

router.get(
    '/content/:id',
    requireLogin,
    homeController.showContentDetails
);

router.post(
    '/content/:id/like',
    requireLogin,
    homeController.toggleMovieLike
);

router.post(
    '/content/:id/reviews',
    requireLogin,
    homeController.addMovieReview
);

module.exports = router;