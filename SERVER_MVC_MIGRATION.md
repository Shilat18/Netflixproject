# Server MVC Migration

## Goal

Move the project from a single-server style into a clear MVC architecture.

MVC means:

```text
Model      -> data and database logic
View       -> EJS pages
Controller -> request logic
Route      -> URL definitions
```

## Previous Architecture

At the beginning, the server logic was concentrated around `server.js`.

It handled too many responsibilities:

1. Express setup.
2. Session setup.
3. Static files.
4. Login logic.
5. Profile logic.
6. Movie data.
7. Routes.
8. Server startup.

This worked for a small project, but it became harder to expand.

## Final Architecture

```text
server.js
app.js
config/
  db.js

routes/
  authRoutes.js
  profileRoutes.js
  homeRoutes.js
  adminRoutes.js

controllers/
  authController.js
  profileController.js
  homeController.js
  adminController.js

models/
  userModel.js
  personaModel.js
  movieModel.js

middleware/
  authMiddleware.js

views/
public/
```

## Migration Steps

### Step 1: Create MVC folders

Created the main folders:

```text
routes/
controllers/
models/
middleware/
```

Each folder has one clear responsibility.

### Step 2: Move Express setup to `app.js`

`app.js` now configures:

1. EJS.
2. Static files.
3. Request body parsing.
4. Sessions.
5. Route registration.

### Step 3: Keep `server.js` small

`server.js` now only:

1. Loads environment variables.
2. Connects to MongoDB.
3. Starts the server.

### Step 4: Add MongoDB connection

Created:

```text
config/db.js
```

The app tries to connect to MongoDB.
If MongoDB is not available, it uses in-memory fallback data.

### Step 5: Move authentication logic

Created:

```text
routes/authRoutes.js
controllers/authController.js
models/userModel.js
```

This includes:

1. Login.
2. Signup.
3. Logout.
4. Password hashing.
5. Safe session user data.

### Step 6: Move profile logic

Created:

```text
routes/profileRoutes.js
controllers/profileController.js
models/personaModel.js
```

This includes:

1. Showing profiles.
2. Selecting a profile.
3. MongoDB profile data.
4. Fallback profiles.

### Step 7: Move homepage and content logic

Created:

```text
routes/homeRoutes.js
controllers/homeController.js
models/movieModel.js
```

This includes:

1. Homepage data.
2. Content details.
3. Continue Watching.
4. Recommendations.
5. Popular titles.
6. Categories.

### Step 8: Add middleware

Created:

```text
middleware/authMiddleware.js
```

This protects private routes with:

```text
requireLogin
requireAdmin
```

### Step 9: Add admin area

Created:

```text
routes/adminRoutes.js
controllers/adminController.js
views/admin-users.ejs
views/admin-content.ejs
```

Admin can:

1. View users.
2. View content.
3. Add content.
4. Edit content.
5. Delete content.

### Step 10: Add reviews

Added review logic to:

```text
controllers/homeController.js
models/movieModel.js
views/content-details.ejs
```

Users can add a rating and short review to a content page.

### Step 11: Add mood recommendations

Added mood data and UI to:

```text
models/movieModel.js
views/homepage.ejs
public/script.js
public/homepage.css
```

Users can choose a mood and see matching content.

### Step 12: Add My List

Added user saved-list logic to:

```text
models/userModel.js
controllers/homeController.js
routes/homeRoutes.js
views/my-list.ejs
```

Users can save and remove titles from their personal list.

### Step 13: Update views

The EJS pages now receive data from controllers instead of hardcoded server logic.

Main views:

```text
netflix.ejs
signup.ejs
profiles.ejs
homepage.ejs
content-details.ejs
my-list.ejs
admin-users.ejs
admin-content.ejs
```

### Step 14: Test the full flow

Tested these routes:

1. `/`
2. `/login`
3. `/signup`
4. `/profiles`
5. `/homepage`
6. `/content/:id`
7. `/content/:id/reviews`
8. `/my-list`
9. `/admin/users`
10. `/admin/content`
11. `/logout`

### Step 15: Clean server responsibilities

The final structure separates the app into small files.

Each file has a focused job:

1. Routes define URLs.
2. Controllers handle requests.
3. Models manage data.
4. Views render HTML.
5. Middleware protects private pages.
6. `server.js` starts the app.

## Final Result

The project is now easier to:

1. Read.
2. Debug.
3. Present.
4. Expand with new features.
5. Connect to MongoDB.
6. Run even when MongoDB is unavailable.
