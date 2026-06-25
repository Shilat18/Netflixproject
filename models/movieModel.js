// Step 6: movie data lives in the model.
const movies = [
    { id: 1, title: 'Poker Night', description: 'The ultimate card game experience.', image: 'poker.jpg' },
    { id: 2, title: 'Stranger Things', description: 'A young boy vanishes, uncovering a mystery.', image: 'stranger.jpg' },
    { id: 3, title: 'Wednesday', description: 'Smart, sarcastic and a little dead inside.', image: 'wednesday.jpg' }
];

function getAllMovies() {
    return movies;
}

module.exports = {
    getAllMovies
};
