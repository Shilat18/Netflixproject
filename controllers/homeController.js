const movieModel = require('../models/movieModel');

// Personal feed page logic.
function showHomepage(req, res) {
    res.render('homepage', {
        pageTitle: 'Home Page - Netflix',
        movies: movieModel.getAllMovies(),
        feed: movieModel.getPersonalFeed(req.session.user),
        currentUser: req.session.user
    });
}

function showContentDetails(req, res) {
    const movie = movieModel.getMovieById(req.params.id);

    if (!movie) {
        return res.status(404).send('Content not found');
    }

    res.render('content-details', {
        movie,
        currentUser: req.session.user
    });
}

module.exports = {
    showHomepage,
    showContentDetails
};
