const userModel = require('../models/userModel');
const movieModel = require('../models/movieModel');


// =========================
// Users management
// =========================

// Render the admin users page with optional messages and form data.
async function renderUsersPage(req, res, options = {}) {
    const users = await userModel.getAllUsers();

    res.render('admin-users', {
        users,
        currentUser: req.session.user,
        errorMessage: options.errorMessage || null,
        successMessage: options.successMessage || null,
        formData: options.formData || {}
    });
}

// Show all users.
async function showUsers(req, res) {
    try {
        await renderUsersPage(req, res, {
            successMessage:
                req.query.created === '1'
                    ? 'User created successfully.'
                    : null
        });
    } catch (err) {
        console.error('Admin users error:', err.message);
        res.status(500).send('Could not load users');
    }
}

// Create a new user through the admin page.
async function addUser(req, res) {
    const { name, email, password, role } = req.body;

    const formData = {
        name,
        email,
        role
    };

    try {
        if (!name || !email || !password || !role) {
            return await renderUsersPage(req, res, {
                errorMessage: 'Please fill in all user fields.',
                formData
            });
        }

        if (password.length < 6) {
            return await renderUsersPage(req, res, {
                errorMessage:
                    'Password must contain at least 6 characters.',
                formData
            });
        }

        if (role !== 'user' && role !== 'admin') {
            return await renderUsersPage(req, res, {
                errorMessage: 'Invalid user role.',
                formData
            });
        }

        const newUser = await userModel.createUser({
            name,
            email,
            password,
            role
        });

        if (!newUser) {
            return await renderUsersPage(req, res, {
                errorMessage:
                    'A user with this email already exists.',
                formData
            });
        }

        return res.redirect('/admin/users?created=1');
    } catch (err) {
        console.error('Admin add user error:', err.message);

        return await renderUsersPage(req, res, {
            errorMessage: 'Could not create user.',
            formData
        });
    }
}


// =========================
// Content management
// =========================

// Validate content form fields.
function validateContentInput(body) {
    const requiredFields = [
        'title',
        'description',
        'category',
        'year',
        'rating',
        'image',
        'videoUrl'
    ];

    const missingField = requiredFields.find(function (field) {
        return (
            body[field] === undefined ||
            body[field] === null ||
            String(body[field]).trim() === ''
        );
    });

    if (missingField) {
        return 'Please fill in all required content fields.';
    }

    const year = Number(body.year);
    const rating = Number(body.rating);
    const progress = Number(body.progress || 0);

    if (Number.isNaN(year) || year < 1900) {
        return 'Please enter a valid release year.';
    }

    if (
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 5
    ) {
        return 'Rating must be between 0 and 5.';
    }

    if (
        Number.isNaN(progress) ||
        progress < 0 ||
        progress > 100
    ) {
        return 'Progress must be between 0 and 100.';
    }

    return null;
}

// Render the content management page.
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

// Show all content.
async function showContentManager(req, res) {
    try {
        await renderContentManager(req, res);
    } catch (err) {
        console.error('Admin content error:', err.message);
        res.status(500).send('Could not load content manager');
    }
}

// Show the edit form for one content item.
async function showEditContent(req, res) {
    try {
        const editMovie =
            await movieModel.getMovieById(req.params.id);

        if (!editMovie) {
            return res.status(404).send('Content not found');
        }

        return await renderContentManager(req, res, {
            editMovie
        });
    } catch (err) {
        console.error('Edit content error:', err.message);
        return res.status(500).send('Could not load edit form');
    }
}

// Add new content.
async function addContent(req, res) {
    const errorMessage = validateContentInput(req.body);

    try {
        if (errorMessage) {
            return await renderContentManager(req, res, {
                errorMessage,
                formData: req.body
            });
        }

        await movieModel.createMovie(req.body);

        return res.redirect('/admin/content');
    } catch (err) {
        console.error('Add content error:', err.message);

        return await renderContentManager(req, res, {
            errorMessage: 'Could not add content.',
            formData: req.body
        });
    }
}

// Update existing content.
async function updateContent(req, res) {
    const errorMessage = validateContentInput(req.body);

    try {
        const editMovie =
            await movieModel.getMovieById(req.params.id);

        if (!editMovie) {
            return res.status(404).send('Content not found');
        }

        if (errorMessage) {
            return await renderContentManager(req, res, {
                editMovie,
                errorMessage,
                formData: req.body
            });
        }

        await movieModel.updateMovie(
            req.params.id,
            req.body
        );

        return res.redirect('/admin/content');
    } catch (err) {
        console.error('Update content error:', err.message);

        return res.status(500).send('Could not update content');
    }
}

// Delete content.
async function deleteContent(req, res) {
    try {
        await movieModel.deleteMovie(req.params.id);

        return res.redirect('/admin/content');
    } catch (err) {
        console.error('Delete content error:', err.message);

        return res.status(500).send('Could not delete content');
    }
}


// =========================
// Statistics
// =========================

// Show statistics and prepare data for the D3 charts.
async function showStatistics(req, res) {
    try {
        const users = await userModel.getAllUsers();
        const movies = await movieModel.getAllMovies();

        const totalUsers = users.length;
        const totalMovies = movies.length;

        const totalViews = movies.reduce(
            function (sum, movie) {
                return sum + Number(movie.views || 0);
            },
            0
        );

        const ratingSum = movies.reduce(
            function (sum, movie) {
                return sum + Number(movie.rating || 0);
            },
            0
        );

        const averageRating =
            totalMovies > 0
                ? (ratingSum / totalMovies).toFixed(1)
                : 0;

        const topMovies = [...movies]
            .sort(function (a, b) {
                return (
                    Number(b.views || 0) -
                    Number(a.views || 0)
                );
            })
            .slice(0, 10)
            .map(function (movie) {
                return {
                    title: movie.title,
                    views: Number(movie.views || 0)
                };
            });

        const categoryMap = {};

        movies.forEach(function (movie) {
            const category = movie.category || 'Other';

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }

            categoryMap[category]++;
        });

        const categoryStatistics =
            Object.keys(categoryMap).map(function (category) {
                return {
                    category,
                    amount: categoryMap[category]
                };
            });

        return res.render('admin-statistics', {
            currentUser: req.session.user,
            totalUsers,
            totalMovies,
            totalViews,
            averageRating,
            topMovies,
            categoryStatistics
        });
    } catch (err) {
        console.error('Statistics error:', err.message);

        return res.status(500).send(
            'Could not load statistics'
        );
    }
}


// Export controller functions for the routes.
module.exports = {
    addContent,
    addUser,
    deleteContent,
    showContentManager,
    showEditContent,
    showStatistics,
    showUsers,
    updateContent
};