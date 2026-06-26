const movieModel = require('../models/movieModel');

// Personal feed page logic.
async function showHomepage(req, res) {
    try {
        const movies = await movieModel.getAllMovies();
        const feed = movieModel.buildPersonalFeed(req.session.user, movies);

        res.render('homepage', {
            pageTitle: 'Home Page - Netflix',
            movies,
            feed,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Homepage error:', err.message);
        res.status(500).send('Could not load homepage');
    }
}

async function showContentDetails(req, res) {
    try {
        const movie = await movieModel.getMovieById(req.params.id);

        if (!movie) {
            return res.status(404).send('Content not found');
        }

        res.render('content-details', {
            movie,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Content details error:', err.message);
        res.status(500).send('Could not load content details');
    }
}

async function addMovieReview(req, res) {
    try {
        // Use the logged-in user name as the review author.
        const movie = await movieModel.addReview(req.params.id, {
            user: req.session.user ? req.session.user.name : 'Guest',
            rating: req.body.rating,
            text: req.body.reviewText
        });

        if (!movie) {
            return res.redirect(`/content/${req.params.id}#reviews`);
        }

        res.redirect(`/content/${movie.id}#reviews`);
    } catch (err) {
        console.error('Add review error:', err.message);
        res.status(500).send('Could not add review');
    }
}

module.exports = {
    addMovieReview,
    showHomepage,
    showContentDetails
};
