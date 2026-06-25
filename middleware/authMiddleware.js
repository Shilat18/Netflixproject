// Step 4: reusable login protection.
function requireLogin(req, res, next) {
    if (req.session && req.session.userLoggedIn) {
        return next();
    }

    res.redirect('/');
}

module.exports = {
    requireLogin
};
