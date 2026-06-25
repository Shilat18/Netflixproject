const app = require('./app');

const PORT = process.env.PORT || 3000;

// Step 3: server startup only.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
