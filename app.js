const express = require('express');
const path = require('path');
const session = require('express-session');
const authController = require('./controllers/authController');
const { requireLogin, requireAdmin } = require('./middleware/authMiddleware');
const personaModel = require('./models/personaModel');
const movieModel = require('./models/movieModel');
const userModel = require('./models/userModel');

const app = express();

// Step 2: app-level Express configuration.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve public assets.
app.use(express.static(path.join(__dirname, 'public')));

// Parse form and JSON request bodies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Step 8: store logged-in users in a secure session.
app.use(session({
    secret: process.env.SESSION_SECRET || 'netflix_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 10 * 60 * 1000
    }
}));

// Step 8: authentication routes.
app.get('/', authController.showLoginPage);
app.post('/login', authController.login);
app.get('/signup', authController.showSignupPage);
app.post('/signup', authController.signup);

// Step 8: protected profile routes.
app.get('/profiles', requireLogin, (req, res) => {
    res.render('profiles', {
        personasList: personaModel.getAllPersonas(),
        currentUser: req.session.user
    });
});

app.post('/profiles/add', requireLogin, (req, res) => {
    const { personaName } = req.body;

    if (personaName && personaName.trim() !== '') {
        personaModel.addPersona(personaName);
    }

    res.redirect('/profiles');
});

// Step 9: personal feed page.
app.get('/homepage', requireLogin, (req, res) => {
    res.render('homepage', {
        pageTitle: 'Home Page - Netflix',
        movies: movieModel.getAllMovies(),
        feed: movieModel.getPersonalFeed(req.session.user),
        currentUser: req.session.user
    });
});

// Step 9: content details page.
app.get('/content/:id', requireLogin, (req, res) => {
    const movie = movieModel.getMovieById(req.params.id);

    if (!movie) {
        return res.status(404).send('Content not found');
    }

    res.render('content-details', {
        movie,
        currentUser: req.session.user
    });
});

// Step 8: admin-only users page.
app.get('/admin/users', requireLogin, requireAdmin, (req, res) => {
    res.render('admin-users', {
        users: userModel.getAllUsers(),
        currentUser: req.session.user
    });
});

app.get('/logout', authController.logout);

module.exports = app;
