# Server Migration Steps: Current Architecture to MVC

## Goal

Move the current Express server from one large `server.js` file into a clean MVC structure.

MVC means:

```text
Model      -> handles data
View       -> displays pages
Controller -> handles request logic
```

## Current Architecture

The current server is built mostly inside `server.js`.

It currently handles:

1. Express setup.
2. EJS view setup.
3. Static files.
4. Sessions.
5. Login logic.
6. Profile data.
7. Movie data.
8. All routes.
9. Server startup.

This works, but the file becomes harder to maintain as the project grows.

## Target MVC Structure

```text
server.js
app.js

routes/
  authRoutes.js
  profileRoutes.js
  homeRoutes.js

controllers/
  authController.js
  profileController.js
  homeController.js

models/
  personaModel.js
  movieModel.js

middleware/
  authMiddleware.js

views/
public/
```

## Migration Steps

### Step 1: Create MVC folders

Create these folders:

```text
routes/
controllers/
models/
middleware/
```

Keep `views/` and `public/` as they are.

### Step 2: Create `app.js`

Move the Express configuration from `server.js` into `app.js`.

This includes:

1. View engine setup.
2. Static files.
3. Body parsing.
4. Session setup.
5. Route registration.

### Step 3: Keep `server.js` small

Leave only the server startup code in `server.js`.

It should:

1. Import `app`.
2. Define the port.
3. Run `app.listen()`.

### Step 4: Move login middleware

Move `requireLogin` into:

```text
middleware/authMiddleware.js
```

Export it and use it on protected routes.

### Step 5: Create the persona model

Move the `personas` array into:

```text
models/personaModel.js
```

Add these functions:

```text
getAllPersonas()
addPersona(name)
```

### Step 6: Create the movie model

Move the `moviesFeed` array into:

```text
models/movieModel.js
```

Add this function:

```text
getAllMovies()
```

### Step 7: Create the auth controller

Create:

```text
controllers/authController.js
```

Move the logic for:

1. Showing the login page.
2. Handling login.
3. Handling logout.

### Step 8: Create the profile controller

Create:

```text
controllers/profileController.js
```

Move the logic for:

1. Showing profiles.
2. Adding a profile.

Use `personaModel` inside this controller.

### Step 9: Create the home controller

Create:

```text
controllers/homeController.js
```

Move the homepage logic into this file.

Use `movieModel` inside this controller.

### Step 10: Create auth routes

Create:

```text
routes/authRoutes.js
```

Add routes for:

1. `GET /`
2. `POST /login`
3. `GET /logout`

Connect them to `authController`.

### Step 11: Create profile routes

Create:

```text
routes/profileRoutes.js
```

Add routes for:

1. `GET /profiles`
2. `POST /profiles/add`

Protect both routes with `requireLogin`.

### Step 12: Create home routes

Create:

```text
routes/homeRoutes.js
```

Add route:

```text
GET /homepage
```

Protect it with `requireLogin`.

### Step 13: Register routes in `app.js`

Import all route files into `app.js`.

Register them with:

```text
app.use(...)
```

### Step 14: Test the server

Run the project and test:

1. `/`
2. `/login`
3. `/profiles`
4. `/profiles/add`
5. `/homepage`
6. `/logout`

### Step 15: Clean old code

Remove route logic, data arrays, and middleware from `server.js`.

Make sure each part now lives in the correct MVC file.

## Final Result

After the migration:

1. `server.js` starts the server.
2. `app.js` configures the app.
3. Routes define URLs.
4. Controllers handle logic.
5. Models handle data.
6. Views display pages.

The project will be easier to read, test, and expand.
