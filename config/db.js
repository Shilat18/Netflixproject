const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/netflixproject';

// Connect to MongoDB when it is available.
async function connectDB() {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000
        });

        console.log(`MongoDB connected: ${mongoose.connection.name}`);
        return true;
    } catch (err) {
        console.warn(`MongoDB connection skipped: ${err.message}`);
        console.warn('Using temporary in-memory models until MongoDB is available.');
        return false;
    }
}

module.exports = {
    connectDB
};
