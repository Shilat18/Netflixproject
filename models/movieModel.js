const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, {
    _id: false
});

const contentSchema = new mongoose.Schema({
    contentId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    views: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    tags: {
        type: [String],
        default: []
    },
    moods: {
        type: [String],
        default: []
    },
    reviews: {
        type: [reviewSchema],
        default: []
    }
}, {
    timestamps: true
});

const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);

// Temporary content is used only when MongoDB is not available.
const memoryMovies = [
    {
        id: 1,
        title: 'Poker Night',
        description: 'A tense crime thriller around one dangerous card game.',
        category: 'Thriller',
        year: 2024,
        rating: 4.6,
        image: 'poker.jpg',
        views: 940,
        progress: 68,
        tags: ['crime', 'thriller'],
        moods: ['suspense'],
        reviews: [
            { user: 'Shilat', rating: 5, text: 'Very tense and fun to watch.' },
            { user: 'Afik', rating: 4, text: 'Great atmosphere.' }
        ]
    },
    {
        id: 2,
        title: 'Stranger Things',
        description: 'A young boy vanishes, uncovering a mystery and secret experiments.',
        category: 'Sci-Fi',
        year: 2016,
        rating: 4.8,
        image: 'strangerP.jpg',
        views: 1800,
        progress: 35,
        tags: ['sci-fi', 'mystery'],
        moods: ['suspense', 'thoughtful'],
        reviews: [
            { user: 'Admin', rating: 5, text: 'A strong recommendation for sci-fi fans.' }
        ]
    },
    {
        id: 3,
        title: 'Wednesday',
        description: 'Smart, sarcastic and a little dark, Wednesday solves a school mystery.',
        category: 'Fantasy',
        year: 2022,
        rating: 4.5,
        image: 'wednesdayP.jpg',
        views: 1650,
        progress: 0,
        tags: ['fantasy', 'mystery'],
        moods: ['funny', 'suspense'],
        reviews: [
            { user: 'Test User', rating: 4, text: 'Funny and stylish.' }
        ]
    },
    {
        id: 4,
        title: 'Ginny and Georgia',
        description: 'A mother and daughter try to build a new life in a new town.',
        category: 'Drama',
        year: 2021,
        rating: 4.2,
        image: 'ginny-georgia.jpg',
        views: 760,
        progress: 22,
        tags: ['drama', 'family'],
        moods: ['cry', 'thoughtful'],
        reviews: [
            { user: 'Maya', rating: 4, text: 'Emotional and easy to binge.' }
        ]
    },
    {
        id: 5,
        title: 'Bridgerton',
        description: 'Romance, secrets and society drama in Regency-era London.',
        category: 'Drama',
        year: 2020,
        rating: 4.4,
        image: 'bridgertonP.jpg',
        views: 1300,
        progress: 0,
        tags: ['drama', 'romance'],
        moods: ['romantic', 'cry'],
        reviews: [
            { user: 'Dana', rating: 5, text: 'Beautiful and dramatic.' }
        ]
    },
    {
        id: 6,
        title: 'Emily in Paris',
        description: 'A marketing executive starts a bright new life in Paris.',
        category: 'Comedy',
        year: 2020,
        rating: 4.0,
        image: 'emilyinparis.jpg',
        views: 690,
        progress: 0,
        tags: ['comedy', 'romance'],
        moods: ['calm', 'funny', 'romantic'],
        reviews: [
            { user: 'Noa', rating: 4, text: 'Light and colorful.' }
        ]
    },
    {
        id: 7,
        title: 'The Kissing Booth',
        description: 'A teen romance changes friendships and first-love plans.',
        category: 'Romance',
        year: 2018,
        rating: 3.9,
        image: 'kissing.jpg',
        views: 820,
        progress: 12,
        tags: ['romance', 'teen'],
        moods: ['calm', 'romantic', 'funny'],
        reviews: [
            { user: 'Lior', rating: 3, text: 'Cute and simple.' }
        ]
    }
];

const moodOptions = [
    { id: 'calm', emoji: '😌', label: 'Relaxed' },
    { id: 'funny', emoji: '😂', label: 'Funny' },
    { id: 'cry', emoji: '😭', label: 'I want to cry' },
    { id: 'suspense', emoji: '😱', label: 'Suspense' },
    { id: 'romantic', emoji: '🥰', label: 'Romantic' },
    { id: 'thoughtful', emoji: '🤯', label: 'Makes me think' }
];

let checkedDefaultMongoContent = false;

function isMongoReady() {
    return mongoose.connection.readyState === 1;
}

function toMongoSeed(movie) {
    return {
        contentId: movie.id,
        title: movie.title,
        description: movie.description,
        category: movie.category,
        year: movie.year,
        rating: movie.rating,
        image: movie.image,
        views: movie.views,
        progress: movie.progress,
        tags: movie.tags,
        moods: movie.moods,
        reviews: movie.reviews
    };
}

function getSafeMovie(movie) {
    if (!movie) {
        return null;
    }

    const rawMovie = typeof movie.toObject === 'function' ? movie.toObject() : movie;

    return {
        id: rawMovie.id || rawMovie.contentId || rawMovie._id.toString(),
        title: rawMovie.title,
        description: rawMovie.description,
        category: rawMovie.category,
        year: rawMovie.year,
        rating: rawMovie.rating,
        image: rawMovie.image,
        views: rawMovie.views,
        progress: rawMovie.progress,
        tags: rawMovie.tags || [],
        moods: rawMovie.moods || [],
        reviews: rawMovie.reviews || []
    };
}

async function ensureDefaultMongoContent() {
    if (!isMongoReady() || checkedDefaultMongoContent) {
        return;
    }

    const contentCount = await Content.countDocuments();

    if (contentCount === 0) {
        await Content.create(memoryMovies.map(toMongoSeed));
    }

    checkedDefaultMongoContent = true;
}

async function getAllMovies() {
    if (isMongoReady()) {
        await ensureDefaultMongoContent();
        const movies = await Content.find({}).sort({ contentId: 1 });
        return movies.map(getSafeMovie);
    }

    return memoryMovies.map(getSafeMovie);
}

async function getMovieById(id) {
    if (isMongoReady()) {
        await ensureDefaultMongoContent();

        const numericId = Number(id);

        if (!Number.isNaN(numericId)) {
            return getSafeMovie(await Content.findOne({ contentId: numericId }));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return getSafeMovie(await Content.findById(id));
    }

    return getSafeMovie(memoryMovies.find((movie) => movie.id === Number(id)));
}

// Titles the user already started watching.
function getContinueWatching(movies) {
    return movies
        .filter((movie) => movie.progress > 0 && movie.progress < 100)
        .sort((a, b) => b.progress - a.progress);
}

// Simple recommendations by user role.
function getRecommendations(user, movies) {
    const preferredCategories = user && user.role === 'admin'
        ? ['Thriller', 'Sci-Fi', 'Fantasy']
        : ['Drama', 'Comedy', 'Romance'];

    return movies
        .filter((movie) => preferredCategories.includes(movie.category))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
}

// Top titles by views.
function getPopularMovies(movies) {
    return [...movies]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
}

// Group feed titles by category.
function getMoviesByCategory(movies) {
    return movies.reduce((groups, movie) => {
        if (!groups[movie.category]) {
            groups[movie.category] = [];
        }

        groups[movie.category].push(movie);
        return groups;
    }, {});
}

function getMoodOptions() {
    return moodOptions;
}

function getMoodMovies(movies) {
    return movies.filter((movie) => Array.isArray(movie.moods) && movie.moods.length > 0);
}

function buildPersonalFeed(user, movies) {
    const popular = getPopularMovies(movies);

    return {
        hero: popular[0],
        continueWatching: getContinueWatching(movies),
        recommendations: getRecommendations(user, movies),
        popular,
        byCategory: getMoviesByCategory(movies),
        moods: getMoodOptions(),
        moodMovies: getMoodMovies(movies)
    };
}

// Build all feed sections for the homepage.
async function getPersonalFeed(user) {
    const movies = await getAllMovies();
    return buildPersonalFeed(user, movies);
}

module.exports = {
    Content,
    buildPersonalFeed,
    getAllMovies,
    getMovieById,
    getMoodOptions,
    getMoodMovies,
    getPersonalFeed
};
