// Step 5: profile data lives in the model.
let personas = [
    { id: 1, name: 'User 1', image: '/images/wednesday.jpg' },
    { id: 2, name: 'User 2', image: '/images/stranger.jpg' },
    { id: 3, name: 'User 3', image: '/images/ester.jpg' },
    { id: 4, name: 'User 4', image: '/images/proffesor.jpg' }
];

function getAllPersonas() {
    return personas;
}

function addPersona(name) {
    const newPersona = {
        id: personas.length + 1,
        name: name.trim(),
        image: '/images/default-avatar.png'
    };

    personas.push(newPersona);
    return newPersona;
}

module.exports = {
    getAllPersonas,
    addPersona
};
