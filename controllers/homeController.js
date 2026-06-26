const movieModel = require('../models/movieModel');
const userModel = require('../models/userModel');

function getSafeRedirect(value) {
    if (!value || typeof value !== 'string') {
        return '/homepage';
    }

    return value.startsWith('/') && !value.startsWith('//') ? value : '/homepage';
}

function markSavedMovies(movies, myListIds) {
    const savedIds = new Set(myListIds.map(String));

    return movies.map((movie) => ({
        ...movie,
        isInMyList: savedIds.has(String(movie.id))
    }));
}

async function getCurrentUserList(req) {
    const myList = await userModel.getMyListIds(req.session.user.id);
    req.session.user.myList = myList;

    return myList;
}

// Personal feed page logic.
async function showHomepage(req, res) {
    try {
        const myList = await getCurrentUserList(req);
        const movies = markSavedMovies(await movieModel.getAllMovies(), myList);
        const feed = movieModel.buildPersonalFeed(req.session.user, movies);

        // Keep the homepage stable even if an older feed shape is loaded.
        feed.moods = feed.moods || movieModel.getMoodOptions();
        feed.moodMovies = feed.moodMovies || movieModel.getMoodMovies(movies);

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
        const myList = await getCurrentUserList(req);
        const movie = await movieModel.getMovieById(req.params.id);

        if (!movie) {
            return res.status(404).send('Content not found');
        }

        res.render('content-details', {
            movie: {
                ...movie,
                isInMyList: myList.includes(String(movie.id))
            },
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

async function showMyList(req, res) {
    try {
        const myList = await getCurrentUserList(req);
        const movies = markSavedMovies(await movieModel.getAllMovies(), myList);
        const myListMovies = movies.filter((movie) => movie.isInMyList);

        res.render('my-list', {
            pageTitle: 'My List - Netflix',
            movies: myListMovies,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('My list error:', err.message);
        res.status(500).send('Could not load my list');
    }
}

async function toggleMyList(req, res) {
    const redirectTo = getSafeRedirect(req.body.redirectTo);

    try {
        // Only save real content ids.
        const movie = await movieModel.getMovieById(req.params.id);

        if (!movie) {
            return res.redirect(redirectTo);
        }

        const updatedUser = await userModel.toggleMyListMovie(req.session.user.id, movie.id);

        if (updatedUser) {
            req.session.user = updatedUser;
        }

        res.redirect(redirectTo);
    } catch (err) {
        console.error('Toggle my list error:', err.message);
        res.redirect(redirectTo);
    }
}

module.exports = {
    addMovieReview,
    showHomepage,
    showContentDetails,
    showMyList,
    toggleMyList
};
