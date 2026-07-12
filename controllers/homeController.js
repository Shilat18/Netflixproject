const movieModel =
    require('../models/movieModel');

const userModel =
    require('../models/userModel');


function getSafeRedirect(value) {
    if (
        !value ||
        typeof value !== 'string'
    ) {
        return '/homepage';
    }

    if (
        value.startsWith('/') &&
        !value.startsWith('//')
    ) {
        return value;
    }

    return '/homepage';
}

function markSavedMovies(
    movies,
    myListIds,
    currentUserId
) {
    const savedIds =
        new Set(
            myListIds.map(String)
        );

    const normalizedUserId =
        String(currentUserId);

    return movies.map(function (movie) {
        const likedBy =
            (movie.likedBy || []).map(String);

        return {
            ...movie,

            isInMyList:
                savedIds.has(
                    String(movie.id)
                ),

            isLiked:
                likedBy.includes(
                    normalizedUserId
                ),

            likeCount:
                Number(
                    movie.likeCount ||
                    likedBy.length
                )
        };
    });
}

// בונה את רשימת המשך הצפייה לפי המשתמש המחובר.
function buildContinueWatching(
    movies,
    watchHistory
) {
    const moviesById =
        new Map(
            movies.map(function (movie) {
                return [
                    String(movie.id),
                    movie
                ];
            })
        );

    return [...watchHistory]
        .sort(function (a, b) {
            return (
                new Date(b.updatedAt) -
                new Date(a.updatedAt)
            );
        })

        // סרטים שהושלמו כמעט לגמרי לא יופיעו בהמשך צפייה.
        .filter(function (item) {
            return (
                item.currentTime > 0 &&
                item.progress > 0 &&
                item.progress < 95
            );
        })

        .map(function (item) {
            const movie =
                moviesById.get(
                    String(item.movieId)
                );

            if (!movie) {
                return null;
            }

            return {
                ...movie,

                progress:
                    Math.round(
                        item.progress
                    ),

                resumeTime:
                    item.currentTime,

                lastWatchedAt:
                    item.updatedAt
            };
        })

        .filter(Boolean);
}


async function getCurrentUserList(req) {
    const myList =
        await userModel.getMyListIds(
            req.session.user.id
        );

    req.session.user.myList =
        myList;

    return myList;
}


// עמוד הבית והפיד האישי.
async function showHomepage(req, res) {
    try {
        const myList =
            await getCurrentUserList(req);

        const watchHistory =
            await userModel.getWatchHistory(
                req.session.user.id
            );

        const allMovies =
            await movieModel.getAllMovies();

        const movies =
            markSavedMovies(
                allMovies,
                myList,
                req.session.user.id
            );

        const feed =
            movieModel.buildPersonalFeed(
                req.session.user,
                movies
            );

        feed.moods =
            feed.moods ||
            movieModel.getMoodOptions();

        feed.moodMovies =
            feed.moodMovies ||
            movieModel.getMoodMovies(
                movies
            );

        // מחליף את נתוני הדמו ברשימת צפייה אמיתית של המשתמש.
        feed.continueWatching =
            buildContinueWatching(
                movies,
                watchHistory
            );

        res.render('homepage', {
            pageTitle:
                'Home Page - Netflix',

            movies,

            feed,

            currentUser:
                req.session.user,

            myListCount:
                myList.length
        });
    } catch (err) {
        console.error(
            'Homepage error:',
            err.message
        );

        res.status(500).send(
            'Could not load homepage'
        );
    }
}

async function showContentDetails(req, res) {
    try {
        const myList =
            await getCurrentUserList(req);

        const movie =
            await movieModel.getMovieById(
                req.params.id
            );

        if (!movie) {
            return res
                .status(404)
                .send('Content not found');
        }

        const likedBy =
            (movie.likedBy || []).map(String);

        const currentUserId =
            String(req.session.user.id);

        return res.render(
            'content-details',
            {
                movie: {
                    ...movie,

                    isInMyList:
                        myList.includes(
                            String(movie.id)
                        ),

                    isLiked:
                        likedBy.includes(
                            currentUserId
                        ),

                    likeCount:
                        Number(
                            movie.likeCount ||
                            likedBy.length
                        )
                },

                currentUser:
                    req.session.user
            }
        );
    } catch (err) {
        console.error(
            'Content details error:',
            err.message
        );

        return res.status(500).send(
            'Could not load content details'
        );
    }
}

async function toggleMovieLike(req, res) {
    const redirectTo =
        getSafeRedirect(req.body.redirectTo);

    try {
        await movieModel.toggleLike(
            req.params.id,
            req.session.user.id
        );

        return res.redirect(redirectTo);
    } catch (err) {
        console.error(
            'Toggle like error:',
            err.message
        );

        return res.redirect(redirectTo);
    }
}

// פותח את עמוד הצפייה ושולף את נקודת הצפייה האחרונה.
async function showWatchPage(req, res) {
    try {
        const movie = await movieModel.getMovieById(req.params.id);

        if (!movie) {
            return res.status(404).send('Content not found');
        }

        const savedProgress = await userModel.getWatchProgress(
            req.session.user.id,
            movie.id
        );

        let resumeTime = 0;

        if (
            savedProgress &&
            Number(savedProgress.progress) < 95
        ) {
            resumeTime = Number(
                savedProgress.currentTime || 0
            );
        }

        console.log(
            'Loaded watch progress:',
            req.session.user.id,
            movie.id,
            resumeTime
        );

        return res.render('watch', {
            movie,
            currentUser: req.session.user,
            resumeTime
        });
    } catch (err) {
        console.error('Watch page error:', err.message);

        return res.status(500).send(
            'Could not load video'
        );
    }
}

// מקבל מהדפדפן את הזמן הנוכחי ושומר אותו.
async function saveWatchProgress(req, res) {
    console.log(
        'SAVE ROUTE REACHED:',
        req.params.id,
        req.body
    );

    try {
        const movie = await movieModel.getMovieById(
            req.params.id
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        const currentTime = Number(
            req.body.currentTime
        );

        const duration = Number(
            req.body.duration
        );

        if (
            !Number.isFinite(currentTime) ||
            !Number.isFinite(duration) ||
            currentTime < 0 ||
            duration <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid progress data'
            });
        }

        const savedProgress =
            await userModel.saveWatchProgress(
                req.session.user.id,
                movie.id,
                currentTime,
                duration
            );

        console.log(
            'SAVED TO DATABASE:',
            savedProgress
        );

        console.log(
            'Saved watch progress:',
            req.session.user.id,
            movie.id,
            currentTime
        );

        return res.json({
            success: true,
            savedProgress
        });
    } catch (err) {
        console.error(
            'Save watch progress error:',
            err.message
        );

        return res.status(500).json({
            success: false,
            message: 'Could not save progress'
        });
    }
}

async function addMovieReview(
    req,
    res
) {
    try {
        const movie =
            await movieModel.addReview(
                req.params.id,
                {
                    user:
                        req.session.user
                            ? req.session
                                .user.name
                            : 'Guest',

                    rating:
                        req.body.rating,

                    text:
                        req.body.reviewText
                }
            );

        if (!movie) {
            return res.redirect(
                `/content/${req.params.id}#reviews`
            );
        }

        res.redirect(
            `/content/${movie.id}#reviews`
        );
    } catch (err) {
        console.error(
            'Add review error:',
            err.message
        );

        res.status(500).send(
            'Could not add review'
        );
    }
}


async function showMyList(req, res) {
    try {
        const myList =
            await getCurrentUserList(req);

        const movies =
            markSavedMovies(
                await movieModel
                    .getAllMovies(),

                myList,

                req.session.user.id
            );

        const myListMovies =
            movies.filter(
                function (movie) {
                    return movie.isInMyList;
                }
            );

        res.render('my-list', {
            pageTitle:
                'My List - Netflix',

            movies:
                myListMovies,

            currentUser:
                req.session.user
        });
    } catch (err) {
        console.error(
            'My list error:',
            err.message
        );

        res.status(500).send(
            'Could not load my list'
        );
    }
}


async function toggleMyList(req, res) {
    const redirectTo =
        getSafeRedirect(
            req.body.redirectTo
        );

    try {
        const movie =
            await movieModel.getMovieById(
                req.params.id
            );

        if (!movie) {
            return res.redirect(
                redirectTo
            );
        }

        const updatedUser =
            await userModel
                .toggleMyListMovie(
                    req.session.user.id,
                    movie.id
                );

        if (updatedUser) {
            req.session.user =
                updatedUser;
        }

        res.redirect(redirectTo);
    } catch (err) {
        console.error(
            'Toggle my list error:',
            err.message
        );

        res.redirect(redirectTo);
    }
}


module.exports = {
    addMovieReview,
    saveWatchProgress,
    showHomepage,
    showContentDetails,
    showWatchPage,
    showMyList,
    toggleMovieLike,
    toggleMyList
};