const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'netflix_secret_key_123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }
}));

let personas = [
    { id: 1, name: 'User 1', image: '/images/wednesday.jpg' },
    { id: 2, name: 'User 2', image: '/images/stranger.jpg' },
    { id: 3, name: 'User 3', image: '/images/ester.jpg' },
    { id: 4, name: 'User 4', image: '/images/proffesor.jpg' }
];

const moviesFeed = [
    { id: 1, title: 'Poker Night', description: 'The ultimate card game experience.', image: 'poker.jpg' },
    { id: 2, title: 'Stranger Things', description: 'A young boy vanishes, uncovering a mystery.', image: 'stranger.jpg' },
    { id: 3, title: 'Wednesday', description: 'Smart, sarcastic and a little dead inside.', image: 'wednesday.jpg' }
];

function requireLogin(req, res, next) {
    if (req.session && req.session.userLoggedIn) {
        return next();
    }
    res.redirect('/');
}

app.get('/', (req, res) => {
    if (req.session.userLoggedIn) {
        return res.redirect('/profiles');
    }
    res.render('netflix', { errorMessage: null }); 
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || password.length < 4) {
        return res.render('netflix', { errorMessage: 'פרטים לא חוקיים או שדות ריקים.' });
    }

    if (email === "test@gmail.com" && password === "123456") {
        req.session.userLoggedIn = true;
        res.redirect('/profiles');
    } else {
        res.render('netflix', { errorMessage: 'שם המשתמש או הסיסמה אינם נכונים.' });
    }
});

app.get('/profiles', requireLogin, (req, res) => {
    res.render('profiles', { personasList: personas });
});

app.post('/profiles/add', requireLogin, (req, res) => {
    const { personaName } = req.body;

    if (personaName && personaName.trim() !== "") {
        const newPersona = {
            id: personas.length + 1,
            name: personaName,
            image: '/images/default-avatar.png'
        };
        personas.push(newPersona);
    }
    res.redirect('/profiles');
});

app.get('/homepage', requireLogin, (req, res) => {
    res.render('homepage', {
        pageTitle: 'דף הבית - נטפליקס',
        movies: moviesFeed 
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/homepage');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});