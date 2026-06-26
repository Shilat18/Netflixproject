// Step 9: movie and feed data lives in the model.
const movies = [
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
        reviews: [
            { user: 'Lior', rating: 3, text: 'Cute and simple.' }
        ]
    }
];

function getAllMovies() {
    return movies;
}

function getMovieById(id) {
    return movies.find((movie) => movie.id === Number(id)) || null;
}

// Step 9: titles the user already started watching.
function getContinueWatching() {
    return movies
        .filter((movie) => movie.progress > 0 && movie.progress < 100)
        .sort((a, b) => b.progress - a.progress);
}

// Step 9: simple recommendations by user role.
function getRecommendations(user) {
    const preferredCategories = user && user.role === 'admin'
        ? ['Thriller', 'Sci-Fi', 'Fantasy']
        : ['Drama', 'Comedy', 'Romance'];

    return movies
        .filter((movie) => preferredCategories.includes(movie.category))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
}

// Step 9: top titles by views.
function getPopularMovies() {
    return [...movies]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
}

// Step 9: group feed titles by category.
function getMoviesByCategory() {
    return movies.reduce((groups, movie) => {
        if (!groups[movie.category]) {
            groups[movie.category] = [];
        }

        groups[movie.category].push(movie);
        return groups;
    }, {});
}

// Step 9: build all feed sections for the homepage.
function getPersonalFeed(user) {
    return {
        hero: getPopularMovies()[0],
        continueWatching: getContinueWatching(),
        recommendations: getRecommendations(user),
        popular: getPopularMovies(),
        byCategory: getMoviesByCategory()
    };
}

module.exports = {
    getAllMovies,
    getMovieById,
    getPersonalFeed
};
