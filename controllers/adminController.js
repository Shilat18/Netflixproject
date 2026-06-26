const userModel = require('../models/userModel');

// Admin users page logic.
async function showUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();

        res.render('admin-users', {
            users,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Admin users error:', err.message);
        res.status(500).send('Could not load users');
    }
}

module.exports = {
    showUsers
};
