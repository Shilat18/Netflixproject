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
    videoUrl: {
        type: String,
        default: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
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

// Demo playback URL used when a movie does not have a custom video yet.
const DEFAULT_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

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
        videoUrl: DEFAULT_VIDEO_URL,
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
        videoUrl: DEFAULT_VIDEO_URL,
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
        videoUrl: DEFAULT_VIDEO_URL,
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
        videoUrl: DEFAULT_VIDEO_URL,
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
        videoUrl: DEFAULT_VIDEO_URL,
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
        videoUrl: DEFAULT_VIDEO_URL,
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
        videoUrl: DEFAULT_VIDEO_URL,
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

const moodRules = {
    Thriller: ['suspense'],
    'Sci-Fi': ['suspense', 'thoughtful'],
    Fantasy: ['funny', 'suspense'],
    Drama: ['cry', 'thoughtful'],
    Comedy: ['calm', 'funny'],
    Romance: ['calm', 'romantic']
};

let checkedDefaultMongoContent = false;
let nextMemoryMovieId = Math.max(...memoryMovies.map((movie) => movie.id)) + 1;

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
        videoUrl: movie.videoUrl || DEFAULT_VIDEO_URL,
        views: movie.views,
        progress: movie.progress,
        tags: movie.tags,
        moods: movie.moods,
        reviews: movie.reviews
    };
}

function normalizeContentInput(data) {
    return {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        year: Number(data.year),
        rating: Number(data.rating),
        image: (data.image || 'default-avatar.png').trim(),
        videoUrl: (data.videoUrl || DEFAULT_VIDEO_URL).trim(),
        views: Number(data.views) || 0,
        progress: Number(data.progress) || 0,
        tags: splitList(data.tags),
        moods: splitList(data.moods)
    };
}

function splitList(value) {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

// Validate review input before saving it.
function normalizeReviewInput(data) {
    const rating = Number(data.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return null;
    }

    const text = (data.text || '').trim();
    const user = (data.user || 'Guest').trim();

    if (!text) {
        return null;
    }

    return {
        user,
        rating,
        text
    };
}

// Keep the movie rating in sync with user reviews.
function calculateAverageRating(reviews, fallbackRating) {
    if (!reviews.length) {
        return fallbackRating;
    }

    const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
    return Number((totalRating / reviews.length).toFixed(1));
}

// Infer moods for older MongoDB content that was saved before the mood feature.
function getMovieMoods(rawMovie) {
    if (Array.isArray(rawMovie.moods) && rawMovie.moods.length > 0) {
        return rawMovie.moods;
    }

    const tags = rawMovie.tags || [];
    const inferredMoods = new Set(moodRules[rawMovie.category] || []);

    if (tags.includes('romance')) {
        inferredMoods.add('romantic');
    }

    if (tags.includes('mystery') || tags.includes('thriller')) {
        inferredMoods.add('suspense');
    }

    if (tags.includes('comedy')) {
        inferredMoods.add('funny');
    }

    return Array.from(inferredMoods);
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
        videoUrl: rawMovie.videoUrl || DEFAULT_VIDEO_URL,
        views: rawMovie.views,
        progress: rawMovie.progress,
        tags: rawMovie.tags || [],
        moods: getMovieMoods(rawMovie),
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

        return getSafeMovie(await findMongoMovieById(id));
    }

    return getSafeMovie(memoryMovies.find((movie) => movie.id === Number(id)));
}

// Save a new review in MongoDB or memory fallback.
async function addReview(movieId, reviewData) {
    const review = normalizeReviewInput(reviewData);

    if (!review) {
        return null;
    }

    if (isMongoReady()) {
        await ensureDefaultMongoContent();

        const movie = await findMongoMovieById(movieId);

        if (!movie) {
            return null;
        }

        movie.reviews.push(review);
        movie.rating = calculateAverageRating(movie.reviews, movie.rating);
        await movie.save();

        return getSafeMovie(movie);
    }

    const movie = memoryMovies.find((item) => item.id === Number(movieId));

    if (!movie) {
        return null;
    }

    movie.reviews.push(review);
    movie.rating = calculateAverageRating(movie.reviews, movie.rating);

    return getSafeMovie(movie);
}

async function createMovie(data) {
    const contentData = normalizeContentInput(data);

    if (isMongoReady()) {
        await ensureDefaultMongoContent();

        const lastContent = await Content.findOne({}).sort({ contentId: -1 });
        const nextContentId = lastContent ? lastContent.contentId + 1 : 1;
        const newContent = await Content.create({
            ...contentData,
            contentId: nextContentId,
            reviews: []
        });

        return getSafeMovie(newContent);
    }

    const newMovie = {
        id: nextMemoryMovieId,
        ...contentData,
        reviews: []
    };

    nextMemoryMovieId += 1;
    memoryMovies.push(newMovie);

    return getSafeMovie(newMovie);
}

async function updateMovie(id, data) {
    const contentData = normalizeContentInput(data);

    if (isMongoReady()) {
        await ensureDefaultMongoContent();

        const numericId = Number(id);
        let query = { contentId: numericId };

        if (Number.isNaN(numericId)) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return null;
            }

            query = { _id: id };
        }

        const updatedContent = await Content.findOneAndUpdate(query, contentData, {
            new: true,
            runValidators: true
        });

        return getSafeMovie(updatedContent);
    }

    const movieIndex = memoryMovies.findIndex((movie) => movie.id === Number(id));

    if (movieIndex === -1) {
        return null;
    }

    memoryMovies[movieIndex] = {
        ...memoryMovies[movieIndex],
        ...contentData
    };

    return getSafeMovie(memoryMovies[movieIndex]);
}

// Support both numeric content ids and MongoDB object ids.
async function findMongoMovieById(id) {
    const numericId = Number(id);

    if (!Number.isNaN(numericId)) {
        return Content.findOne({ contentId: numericId });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    return Content.findById(id);
}

async function deleteMovie(id) {
    if (isMongoReady()) {
        await ensureDefaultMongoContent();

        const numericId = Number(id);
        let query = { contentId: numericId };

        if (Number.isNaN(numericId)) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return false;
            }

            query = { _id: id };
        }

        const deletedContent = await Content.findOneAndDelete(query);

        return Boolean(deletedContent);
    }

    const movieIndex = memoryMovies.findIndex((movie) => movie.id === Number(id));

    if (movieIndex === -1) {
        return false;
    }

    memoryMovies.splice(movieIndex, 1);
    return true;
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
    addReview,
    buildPersonalFeed,
    createMovie,
    deleteMovie,
    getAllMovies,
    getMovieById,
    getMoodOptions,
    getMoodMovies,
    getPersonalFeed,
    updateMovie
};
