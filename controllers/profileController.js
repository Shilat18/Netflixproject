const personaModel = require('../models/personaModel');

// Profile page logic.
function showProfiles(req, res) {
    res.render('profiles', {
        personasList: personaModel.getAllPersonas(),
        currentUser: req.session.user
    });
}

function addProfile(req, res) {
    const { personaName } = req.body;

    if (personaName && personaName.trim() !== '') {
        personaModel.addPersona(personaName);
    }

    res.redirect('/profiles');
}

module.exports = {
    showProfiles,
    addProfile
};
