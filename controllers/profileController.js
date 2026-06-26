const personaModel = require('../models/personaModel');

// Profile page logic.
async function showProfiles(req, res) {
    res.render('profiles', {
        personasList: await personaModel.getAllPersonas(),
        currentUser: req.session.user
    });
}

async function addProfile(req, res) {
    const { personaName } = req.body;

    if (personaName && personaName.trim() !== '') {
        await personaModel.addPersona(personaName);
    }

    res.redirect('/profiles');
}

module.exports = {
    showProfiles,
    addProfile
};
