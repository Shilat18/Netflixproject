const userModel = require('../models/userModel');

// Admin users page logic.
function showUsers(req, res) {
    res.render('admin-users', {
        users: userModel.getAllUsers(),
        currentUser: req.session.user
    });
}

module.exports = {
    showUsers
};
