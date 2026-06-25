// Step 7: authentication request logic.
function showLoginPage(req, res) {
    if (req.session.userLoggedIn) {
        return res.redirect('/profiles');
    }

    res.render('netflix', { errorMessage: null });
}

function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password || password.length < 4) {
        return res.render('netflix', { errorMessage: 'Invalid details or empty fields.' });
    }

    if (email === 'test@gmail.com' && password === '123456') {
        req.session.userLoggedIn = true;
        return res.redirect('/profiles');
    }

    res.render('netflix', { errorMessage: 'The username or password is incorrect.' });
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/homepage');
        }

        res.clearCookie('connect.sid');
        res.redirect('/');
    });
}

module.exports = {
    showLoginPage,
    login,
    logout
};
