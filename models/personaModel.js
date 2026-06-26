const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        default: '/images/default-avatar.png'
    }
}, {
    timestamps: true
});

const Persona = mongoose.models.Persona || mongoose.model('Persona', personaSchema);

const defaultPersonas = [
    { id: 1, name: 'User 1', image: '/images/wednesday.jpg' },
    { id: 2, name: 'User 2', image: '/images/stranger.jpg' },
    { id: 3, name: 'User 3', image: '/images/ester.jpg' },
    { id: 4, name: 'User 4', image: '/images/proffesor.jpg' }
];

let personas = [...defaultPersonas];
let nextMemoryPersonaId = 5;
let checkedDefaultMongoPersonas = false;

function isMongoReady() {
    return mongoose.connection.readyState === 1;
}

function getSafePersona(persona) {
    return {
        id: persona.id || persona._id.toString(),
        name: persona.name,
        image: persona.image || '/images/default-avatar.png',
        createdAt: persona.createdAt
    };
}

async function ensureDefaultMongoPersonas() {
    if (!isMongoReady() || checkedDefaultMongoPersonas) {
        return;
    }

    const personaCount = await Persona.countDocuments();

    if (personaCount === 0) {
        await Persona.create(defaultPersonas.map((persona) => ({
            name: persona.name,
            image: persona.image
        })));
    }

    checkedDefaultMongoPersonas = true;
}

async function getAllPersonas() {
    if (isMongoReady()) {
        try {
            await ensureDefaultMongoPersonas();
            const mongoPersonas = await Persona.find({}).sort({ createdAt: 1 });
            return mongoPersonas.map(getSafePersona);
        } catch (err) {
            console.error('Mongo personas read error:', err.message);
        }
    }

    return personas;
}

async function addPersona(name) {
    const trimmedName = name.trim();

    if (isMongoReady()) {
        try {
            await ensureDefaultMongoPersonas();

            const newPersona = await Persona.create({
                name: trimmedName,
                image: '/images/default-avatar.png'
            });

            return getSafePersona(newPersona);
        } catch (err) {
            console.error('Mongo persona create error:', err.message);
        }
    }

    const newPersona = {
        id: nextMemoryPersonaId,
        name: trimmedName,
        image: '/images/default-avatar.png'
    };

    nextMemoryPersonaId += 1;
    personas.push(newPersona);
    return newPersona;
}

module.exports = {
    Persona,
    getAllPersonas,
    getSafePersona,
    addPersona
};
