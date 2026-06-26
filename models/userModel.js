const crypto = require('crypto');

const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = 'sha512';

// Step 8: hash passwords before saving them.
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto
        .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
        .toString('hex');

    return `${salt}:${hash}`;
}

// Step 8: compare login password with stored hash.
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

let nextUserId = 3;

// Temporary users until the project moves to MongoDB.
const users = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@gmail.com',
        passwordHash: hashPassword('admin123'),
        role: 'admin',
        createdAt: new Date()
    },
    {
        id: 2,
        name: 'Test User',
        email: 'test@gmail.com',
        passwordHash: hashPassword('123456'),
        role: 'user',
        createdAt: new Date()
    }
];

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

// Return user data without the password hash.
function getSafeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
}

function findByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return users.find((user) => user.email === normalizedEmail) || null;
}

function findById(id) {
    return users.find((user) => user.id === Number(id)) || null;
}

function createUser({ name, email, password, role = 'user' }) {
    const normalizedEmail = normalizeEmail(email);

    if (findByEmail(normalizedEmail)) {
        return null;
    }

    const newUser = {
        id: nextUserId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role,
        createdAt: new Date()
    };

    nextUserId += 1;
    users.push(newUser);

    return getSafeUser(newUser);
}

// Validate login and return safe session data.
function validateLogin(email, password) {
    const user = findByEmail(email);

    if (!user || !isPasswordMatch(password, user.passwordHash)) {
        return null;
    }

    return getSafeUser(user);
}

function getAllUsers() {
    return users.map(getSafeUser);
}

module.exports = {
    createUser,
    findByEmail,
    findById,
    getAllUsers,
    getSafeUser,
    validateLogin
};
