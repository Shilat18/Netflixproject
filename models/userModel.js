const crypto = require('crypto');
const mongoose = require('mongoose');

const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = 'sha512';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    myList: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Hash passwords before saving them.
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto
        .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
        .toString('hex');

    return `${salt}:${hash}`;
}

// Compare login password with stored hash.
function isPasswordMatch(password, storedPasswordHash) {
    const [salt, originalHash] = storedPasswordHash.split(':');

    if (!salt || !originalHash) {
        return false;
    }

    const candidateHash = hashPassword(password, salt).split(':')[1];
    const originalBuffer = Buffer.from(originalHash, 'hex');
    const candidateBuffer = Buffer.from(candidateHash, 'hex');

    if (originalBuffer.length !== candidateBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(originalBuffer, candidateBuffer);
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function isMongoReady() {
    return mongoose.connection.readyState === 1;
}

let nextMemoryUserId = 3;
let checkedDefaultMongoUsers = false;

// Temporary users are used only when MongoDB is not available.
const memoryUsers = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@gmail.com',
        passwordHash: hashPassword('admin123'),
        role: 'admin',
        myList: [],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        name: 'Test User',
        email: 'test@gmail.com',
        passwordHash: hashPassword('123456'),
        role: 'user',
        myList: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function ensureDefaultMongoUsers() {
    if (!isMongoReady() || checkedDefaultMongoUsers) {
        return;
    }

    const userCount = await User.countDocuments();

    if (userCount === 0) {
        await User.create([
            {
                name: 'Admin',
                email: 'admin@gmail.com',
                passwordHash: hashPassword('admin123'),
                role: 'admin',
                myList: []
            },
            {
                name: 'Test User',
                email: 'test@gmail.com',
                passwordHash: hashPassword('123456'),
                role: 'user',
                myList: []
            }
        ]);
    }

    checkedDefaultMongoUsers = true;
}

// Return user data without the password hash.
function getSafeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id || user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        myList: (user.myList || []).map(String),
        createdAt: user.createdAt
    };
}

async function findByEmail(email) {
    const normalizedEmail = normalizeEmail(email);

    if (isMongoReady()) {
        await ensureDefaultMongoUsers();
        return User.findOne({ email: normalizedEmail });
    }

    return memoryUsers.find((user) => user.email === normalizedEmail) || null;
}

async function findById(id) {
    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return User.findById(id);
    }

    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
        return null;
    }

    return memoryUsers.find((user) => user.id === numericId) || null;
}

async function createUser({ name, email, password, role = 'user' }) {
    const normalizedEmail = normalizeEmail(email);

    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return null;
        }

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: hashPassword(password),
            role
        });

        return getSafeUser(newUser);
    }

    if (memoryUsers.find((user) => user.email === normalizedEmail)) {
        return null;
    }

    const newMemoryUser = {
        id: nextMemoryUserId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role,
        myList: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    nextMemoryUserId += 1;
    memoryUsers.push(newMemoryUser);

    return getSafeUser(newMemoryUser);
}

// Validate login and return safe session data.
async function validateLogin(email, password) {
    const user = await findByEmail(email);

    if (!user || !isPasswordMatch(password, user.passwordHash)) {
        return null;
    }

    return getSafeUser(user);
}

async function getAllUsers() {
    if (isMongoReady()) {
        await ensureDefaultMongoUsers();
        const users = await User.find({}).sort({ createdAt: -1 });
        return users.map(getSafeUser);
    }

    return memoryUsers.map(getSafeUser);
}

async function getMyListIds(userId) {
    const user = await findById(userId);

    if (!user) {
        return [];
    }

    return (user.myList || []).map(String);
}

async function toggleMyListMovie(userId, movieId) {
    const normalizedMovieId = String(movieId);

    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        const user = await findById(userId);

        if (!user) {
            return null;
        }

        const currentList = (user.myList || []).map(String);
        user.myList = currentList.includes(normalizedMovieId)
            ? currentList.filter((id) => id !== normalizedMovieId)
            : [...currentList, normalizedMovieId];

        await user.save();
        return getSafeUser(user);
    }

    const user = await findById(userId);

    if (!user) {
        return null;
    }

    const currentList = (user.myList || []).map(String);
    user.myList = currentList.includes(normalizedMovieId)
        ? currentList.filter((id) => id !== normalizedMovieId)
        : [...currentList, normalizedMovieId];
    user.updatedAt = new Date();

    return getSafeUser(user);
}

module.exports = {
    User,
    createUser,
    findByEmail,
    findById,
    getAllUsers,
    getMyListIds,
    getSafeUser,
    hashPassword,
    toggleMyListMovie,
    validateLogin
};
