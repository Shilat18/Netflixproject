// Step 8: reusable login and role protection.
function requireLogin(req, res, next) {
    // Allow only logged-in users.
    if (req.session && req.session.user) {
        return next();
    }

    res.redirect('/');
}

function requireRole(role) {
    return function roleMiddleware(req, res, next) {
        // Allow only users with the required role.
        if (req.session && req.session.user && req.session.user.role === role) {
            return next();
        }

        res.status(403).send('Access denied');
    };
}

function requireAdmin(req, res, next) {
    return requireRole('admin')(req, res, next);
}

module.exports = {
    requireLogin,
    requireRole,
    requireAdmin
};
