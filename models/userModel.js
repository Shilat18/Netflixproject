const crypto = require('crypto');
const mongoose = require('mongoose');

const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = 'sha512';


// כל איבר במערך הזה מייצג נקודת צפייה בתוכן מסוים.
const watchHistoryItemSchema = new mongoose.Schema({
    movieId: {
        type: String,
        required: true
    },

    currentTime: {
        type: Number,
        default: 0,
        min: 0
    },

    duration: {
        type: Number,
        default: 0,
        min: 0
    },

    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false
});


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
    },

    // היסטוריית הצפייה נשמרת בנפרד לכל משתמש.
    watchHistory: {
        type: [watchHistoryItemSchema],
        default: []
    }
}, {
    timestamps: true
});


const User =
    mongoose.models.User ||
    mongoose.model('User', userSchema);


// הצפנת סיסמה.
function hashPassword(
    password,
    salt = crypto.randomBytes(16).toString('hex')
) {
    const hash = crypto
        .pbkdf2Sync(
            password,
            salt,
            HASH_ITERATIONS,
            HASH_KEY_LENGTH,
            HASH_DIGEST
        )
        .toString('hex');

    return `${salt}:${hash}`;
}


// בדיקה האם הסיסמה שהוקלדה מתאימה לסיסמה המוצפנת.
function isPasswordMatch(password, storedPasswordHash) {
    const [salt, originalHash] =
        storedPasswordHash.split(':');

    if (!salt || !originalHash) {
        return false;
    }

    const candidateHash =
        hashPassword(password, salt).split(':')[1];

    const originalBuffer =
        Buffer.from(originalHash, 'hex');

    const candidateBuffer =
        Buffer.from(candidateHash, 'hex');

    if (
        originalBuffer.length !==
        candidateBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        originalBuffer,
        candidateBuffer
    );
}


function normalizeEmail(email) {
    return email.trim().toLowerCase();
}


function isMongoReady() {
    return mongoose.connection.readyState === 1;
}


// ממיר את היסטוריית הצפייה למבנה פשוט ובטוח.
function normalizeWatchHistory(history) {
    return (history || []).map(function (item) {
        return {
            movieId: String(item.movieId),

            currentTime:
                Number(item.currentTime || 0),

            duration:
                Number(item.duration || 0),

            progress:
                Number(item.progress || 0),

            updatedAt:
                item.updatedAt || new Date()
        };
    });
}


let nextMemoryUserId = 3;
let checkedDefaultMongoUsers = false;


// משתמשים זמניים למקרה שאין חיבור ל-MongoDB.
const memoryUsers = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@gmail.com',
        passwordHash: hashPassword('admin123'),
        role: 'admin',
        myList: [],
        watchHistory: [],
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
        watchHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];


async function ensureDefaultMongoUsers() {
    if (
        !isMongoReady() ||
        checkedDefaultMongoUsers
    ) {
        return;
    }

    const userCount =
        await User.countDocuments();

    if (userCount === 0) {
        await User.create([
            {
                name: 'Admin',
                email: 'admin@gmail.com',
                passwordHash:
                    hashPassword('admin123'),
                role: 'admin',
                myList: [],
                watchHistory: []
            },

            {
                name: 'Test User',
                email: 'test@gmail.com',
                passwordHash:
                    hashPassword('123456'),
                role: 'user',
                myList: [],
                watchHistory: []
            }
        ]);
    }

    checkedDefaultMongoUsers = true;
}


// מחזיר משתמש בלי הסיסמה המוצפנת.
function getSafeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id:
            user.id ||
            user._id.toString(),

        name: user.name,

        email: user.email,

        role: user.role,

        myList:
            (user.myList || []).map(String),

        watchHistory:
            normalizeWatchHistory(
                user.watchHistory
            ),

        createdAt:
            user.createdAt
    };
}


async function findByEmail(email) {
    const normalizedEmail =
        normalizeEmail(email);

    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        return User.findOne({
            email: normalizedEmail
        });
    }

    return (
        memoryUsers.find(function (user) {
            return (
                user.email === normalizedEmail
            );
        }) || null
    );
}


async function findById(id) {
    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return null;
        }

        return User.findById(id);
    }

    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
        return null;
    }

    return (
        memoryUsers.find(function (user) {
            return user.id === numericId;
        }) || null
    );
}


async function createUser({
    name,
    email,
    password,
    role = 'user'
}) {
    const normalizedEmail =
        normalizeEmail(email);

    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return null;
        }

        const newUser =
            await User.create({
                name: name.trim(),
                email: normalizedEmail,
                passwordHash:
                    hashPassword(password),
                role,
                myList: [],
                watchHistory: []
            });

        return getSafeUser(newUser);
    }

    const existingMemoryUser =
        memoryUsers.find(function (user) {
            return (
                user.email === normalizedEmail
            );
        });

    if (existingMemoryUser) {
        return null;
    }

    const newMemoryUser = {
        id: nextMemoryUserId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash:
            hashPassword(password),
        role,
        myList: [],
        watchHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    nextMemoryUserId += 1;

    memoryUsers.push(newMemoryUser);

    return getSafeUser(newMemoryUser);
}


// בודק פרטי התחברות.
async function validateLogin(email, password) {
    const user =
        await findByEmail(email);

    if (
        !user ||
        !isPasswordMatch(
            password,
            user.passwordHash
        )
    ) {
        return null;
    }

    return getSafeUser(user);
}


async function getAllUsers() {
    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        const users =
            await User.find({})
                .sort({
                    createdAt: -1
                });

        return users.map(getSafeUser);
    }

    return memoryUsers.map(getSafeUser);
}


async function getMyListIds(userId) {
    const user =
        await findById(userId);

    if (!user) {
        return [];
    }

    return (
        user.myList || []
    ).map(String);
}


async function toggleMyListMovie(
    userId,
    movieId
) {
    const normalizedMovieId =
        String(movieId);

    if (isMongoReady()) {
        await ensureDefaultMongoUsers();

        const user =
            await findById(userId);

        if (!user) {
            return null;
        }

        const currentList =
            (user.myList || []).map(String);

        if (
            currentList.includes(
                normalizedMovieId
            )
        ) {
            user.myList =
                currentList.filter(
                    function (id) {
                        return (
                            id !==
                            normalizedMovieId
                        );
                    }
                );
        } else {
            user.myList = [
                ...currentList,
                normalizedMovieId
            ];
        }

        await user.save();

        return getSafeUser(user);
    }

    const user =
        await findById(userId);

    if (!user) {
        return null;
    }

    const currentList =
        (user.myList || []).map(String);

    if (
        currentList.includes(
            normalizedMovieId
        )
    ) {
        user.myList =
            currentList.filter(
                function (id) {
                    return (
                        id !==
                        normalizedMovieId
                    );
                }
            );
    } else {
        user.myList = [
            ...currentList,
            normalizedMovieId
        ];
    }

    user.updatedAt = new Date();

    return getSafeUser(user);
}


// מחזיר את היסטוריית הצפייה של משתמש.
async function getWatchHistory(userId) {
    const user =
        await findById(userId);

    if (!user) {
        return [];
    }

    return normalizeWatchHistory(
        user.watchHistory
    ).sort(function (a, b) {
        return (
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
        );
    });
}


// מחזיר נקודת צפייה של סרט מסוים.
async function getWatchProgress(
    userId,
    movieId
) {
    const history =
        await getWatchHistory(userId);

    const normalizedMovieId =
        String(movieId);

    return (
        history.find(function (item) {
            return (
                item.movieId ===
                normalizedMovieId
            );
        }) || null
    );
}


// שומר או מעדכן נקודת צפייה.
async function saveWatchProgress(
    userId,
    movieId,
    currentTime,
    duration
) {
    const normalizedMovieId =
        String(movieId);

    const safeDuration =
        Math.max(
            0,
            Number(duration) || 0
        );

    const safeCurrentTime =
        Math.min(
            Math.max(
                0,
                Number(currentTime) || 0
            ),
            safeDuration
        );

    const progress =
        safeDuration > 0
            ? Number(
                (
                    (
                        safeCurrentTime /
                        safeDuration
                    ) * 100
                ).toFixed(1)
            )
            : 0;

    const updatedAt = new Date();

    const user =
        await findById(userId);

    if (!user) {
        return null;
    }

    if (
        !Array.isArray(
            user.watchHistory
        )
    ) {
        user.watchHistory = [];
    }

    const existingIndex =
        user.watchHistory.findIndex(
            function (item) {
                return (
                    String(item.movieId) ===
                    normalizedMovieId
                );
            }
        );

    const progressItem = {
        movieId: normalizedMovieId,
        currentTime: safeCurrentTime,
        duration: safeDuration,
        progress,
        updatedAt
    };

    if (existingIndex === -1) {
        user.watchHistory.push(
            progressItem
        );
    } else {
        user.watchHistory[
            existingIndex
        ].movieId =
            normalizedMovieId;

        user.watchHistory[
            existingIndex
        ].currentTime =
            safeCurrentTime;

        user.watchHistory[
            existingIndex
        ].duration =
            safeDuration;

        user.watchHistory[
            existingIndex
        ].progress =
            progress;

        user.watchHistory[
            existingIndex
        ].updatedAt =
            updatedAt;
    }

    if (isMongoReady()) {
        await user.save();
    } else {
        user.updatedAt = updatedAt;
    }

    return progressItem;
}


module.exports = {
    User,
    createUser,
    findByEmail,
    findById,
    getAllUsers,
    getMyListIds,
    getSafeUser,
    getWatchHistory,
    getWatchProgress,
    hashPassword,
    saveWatchProgress,
    toggleMyListMovie,
    validateLogin
};