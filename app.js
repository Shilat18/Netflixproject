const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const homeRoutes = require('./routes/homeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({
    extended: true
}));


app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'netflix_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 10 * 60 * 1000
    }
}));

app.use(authRoutes);
app.use(profileRoutes);
app.use(homeRoutes);
app.use(adminRoutes);

module.exports = app;