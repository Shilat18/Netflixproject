const express = require('express');
const path = require('path');
const session = require('express-session');
const authController = require('./controllers/authController');
const { requireLogin } = require('./middleware/authMiddleware');
const personaModel = require('./models/personaModel');
const movieModel = require('./models/movieModel');

const app = express();

// Step 2: app-level Express configuration.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve public assets.
app.use(express.static(path.join(__dirname, 'public')));

// Parse form and JSON request bodies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure user sessions.
app.use(session({
    secret: 'netflix_secret_key_123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }
}));

// Temporary routes until route files are created.
app.get('/', authController.showLoginPage);
app.post('/login', authController.login);

app.get('/profiles', requireLogin, (req, res) => {
    res.render('profiles', { personasList: personaModel.getAllPersonas() });
});

app.post('/profiles/add', requireLogin, (req, res) => {
    const { personaName } = req.body;

    if (personaName && personaName.trim() !== '') {
        personaModel.addPersona(personaName);
    }

    res.redirect('/profiles');
});

app.get('/homepage', requireLogin, (req, res) => {
    res.render('homepage', {
        pageTitle: 'Home Page - Netflix',
        movies: movieModel.getAllMovies()
    });
});

app.get('/logout', authController.logout);

module.exports = app;
