const userModel = require('../models/userModel');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Render the login page with optional messages.
function renderLogin(res, errorMessage = null, successMessage = null) {
    res.render('netflix', { errorMessage, successMessage });
}

// Render the signup page and keep typed values.
function renderSignup(res, errorMessage = null, formData = {}) {
    res.render('signup', { errorMessage, formData });
}

// Step 8: authentication request logic.
function showLoginPage(req, res) {
    if (req.session.user) {
        return res.redirect('/profiles');
    }

    renderLogin(res);
}

function showSignupPage(req, res) {
    if (req.session.user) {
        return res.redirect('/profiles');
    }

    renderSignup(res);
}

function login(req, res) {
    const { email, password } = req.body;

    // Validate basic login input.
    if (!email || !password || !isValidEmail(email)) {
        return renderLogin(res, 'Please enter a valid email and password.');
    }

    // Check the hashed password through the model.
    const user = userModel.validateLogin(email, password);

    if (user) {
        // Save only safe user data in the session.
        req.session.user = user;
        req.session.userLoggedIn = true;
        return res.redirect('/profiles');
    }

    renderLogin(res, 'The username or password is incorrect.');
}

function signup(req, res) {
    const { name, email, password, confirmPassword } = req.body;
    const formData = { name, email };

    // Validate signup fields before creating a user.
    if (!name || !email || !password || !confirmPassword) {
        return renderSignup(res, 'All fields are required.', formData);
    }

    if (!isValidEmail(email)) {
        return renderSignup(res, 'Please enter a valid email address.', formData);
    }

    if (password.length < 6) {
        return renderSignup(res, 'Password must contain at least 6 characters.', formData);
    }

    if (password !== confirmPassword) {
        return renderSignup(res, 'Passwords do not match.', formData);
    }

    const newUser = userModel.createUser({
        name,
        email,
        password,
        role: 'user'
    });

    // Do not allow duplicate email accounts.
    if (!newUser) {
        return renderSignup(res, 'A user with this email already exists.', formData);
    }

    renderLogin(res, null, 'Account created successfully. You can sign in now.');
}

function logout(req, res) {
    // Destroy the session and return to login.
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
    showSignupPage,
    login,
    signup,
    logout
};
