const userModel = require('../models/userModel');
const movieModel = require('../models/movieModel');

// Admin users page logic.
async function showUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();

        res.render('admin-users', {
            users,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error('Admin users error:', err.message);
        res.status(500).send('Could not load users');
    }
}

function validateContentInput(body) {
    const requiredFields = ['title', 'description', 'category', 'year', 'rating', 'image'];
    const missingField = requiredFields.find((field) => !body[field] || body[field].trim() === '');

    if (missingField) {
        return 'Please fill in all required content fields.';
    }

    const year = Number(body.year);
    const rating = Number(body.rating);
    const progress = Number(body.progress || 0);

    if (Number.isNaN(year) || year < 1900) {
        return 'Please enter a valid release year.';
    }

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        return 'Rating must be between 0 and 5.';
    }

    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
        return 'Progress must be between 0 and 100.';
    }

    return null;
}

async function renderContentManager(req, res, options = {}) {
    const movies = await movieModel.getAllMovies();

    res.render('admin-content', {
        movies,
        currentUser: req.session.user,
        editMovie: options.editMovie || null,
        errorMessage: options.errorMessage || null,
        successMessage: options.successMessage || null,
        formData: options.formData || {}
    });
}

async function showContentManager(req, res) {
    try {
        await renderContentManager(req, res);
    } catch (err) {
        console.error('Admin content error:', err.message);
        res.status(500).send('Could not load content manager');
    }
}

async function showEditContent(req, res) {
    try {
        const editMovie = await movieModel.getMovieById(req.params.id);

        if (!editMovie) {
            return res.status(404).send('Content not found');
        }

        await renderContentManager(req, res, { editMovie });
    } catch (err) {
        console.error('Edit content error:', err.message);
        res.status(500).send('Could not load edit form');
    }
}

async function addContent(req, res) {
    const errorMessage = validateContentInput(req.body);

    try {
        if (errorMessage) {
            return renderContentManager(req, res, {
                errorMessage,
                formData: req.body
            });
        }

        await movieModel.createMovie(req.body);
        res.redirect('/admin/content');
    } catch (err) {
        console.error('Add content error:', err.message);
        renderContentManager(req, res, {
            errorMessage: 'Could not add content.',
            formData: req.body
        });
    }
}

async function updateContent(req, res) {
    const errorMessage = validateContentInput(req.body);

    try {
        const editMovie = await movieModel.getMovieById(req.params.id);

        if (!editMovie) {
            return res.status(404).send('Content not found');
        }

        if (errorMessage) {
            return renderContentManager(req, res, {
                editMovie,
                errorMessage,
                formData: req.body
            });
        }

        await movieModel.updateMovie(req.params.id, req.body);
        res.redirect('/admin/content');
    } catch (err) {
        console.error('Update content error:', err.message);
        res.status(500).send('Could not update content');
    }
}

async function deleteContent(req, res) {
    try {
        await movieModel.deleteMovie(req.params.id);
        res.redirect('/admin/content');
    } catch (err) {
        console.error('Delete content error:', err.message);
        res.status(500).send('Could not delete content');
    }
}

module.exports = {
    addContent,
    deleteContent,
    showContentManager,
    showEditContent,
    showUsers,
    updateContent
};
