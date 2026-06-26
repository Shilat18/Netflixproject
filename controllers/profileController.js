const personaModel = require('../models/personaModel');

// Profile page logic.
async function showProfiles(req, res) {
    try {
        res.render('profiles', {
            personasList: await personaModel.getAllPersonas(),
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Profiles page error:', err.message);
        res.status(500).send('Could not load profiles');
    }
}

async function addProfile(req, res) {
    try {
        const { personaName } = req.body;

        if (personaName && personaName.trim() !== '') {
            await personaModel.addPersona(personaName);
        }

        res.redirect('/profiles');
    } catch (err) {
        console.error('Add profile error:', err.message);
        res.redirect('/profiles');
    }
}

module.exports = {
    showProfiles,
    addProfile
};
