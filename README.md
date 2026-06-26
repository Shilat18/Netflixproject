# Netflix Project

A Netflix-style web application built with Node.js, Express, EJS, sessions, and MongoDB.

The project was refactored into an MVC structure so the server is easier to read, maintain, and present.

## Main Features

1. User login and signup.
2. Profile selection page.
3. Dynamic homepage with movie sections.
4. Mood-based recommendations.
5. Content details page.
6. Movie reviews and ratings.
7. User My List feature.
8. Admin users page.
9. Admin content CRUD.
10. MongoDB support with an in-memory fallback when MongoDB is not running.

## Project Structure

```text
server.js              Starts the server
app.js                 Configures Express and registers routes
config/db.js           Connects to MongoDB

routes/                Defines application URLs
controllers/           Handles request logic
models/                Handles data and database logic
middleware/            Handles route protection
views/                 EJS pages
public/                CSS, JavaScript, and images
```

## MVC Explanation

```text
Model      Data, MongoDB schemas, and fallback memory data
View       EJS pages shown to the user
Controller Request logic between routes and models
Route      URL definitions and middleware
```

Example flow:

```text
GET /homepage
-> routes/homeRoutes.js
-> controllers/homeController.js
-> models/movieModel.js
-> views/homepage.ejs
```

## Default Users

```text
Admin:
Email: admin@gmail.com
Password: admin123

Regular user:
Email: test@gmail.com
Password: 123456
```

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file based on `.env.example`:

```text
PORT=3000
SESSION_SECRET=replace_with_a_long_random_secret
MONGODB_URI=mongodb://127.0.0.1:27017/netflixproject
```

MongoDB is recommended, but the project can still run without it.
If MongoDB is not available, the models use temporary in-memory data.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Important Routes

```text
GET  /                     Login page
GET  /signup               Signup page
GET  /profiles             Profile selection
GET  /homepage             Main homepage
GET  /content/:id          Content details
POST /content/:id/reviews  Add review
GET  /my-list              User saved list
POST /my-list/:id/toggle   Add or remove saved content
GET  /admin/users          Admin users page
GET  /admin/content        Admin content manager
```

## Presentation Checklist

1. Start the server with `npm start`.
2. Login with the admin user.
3. Show the profiles page.
4. Enter the homepage.
5. Search or sort content.
6. Show mood recommendations.
7. Open a content details page.
8. Add a review.
9. Add content to My List.
10. Open `/my-list`.
11. Open `/admin/users`.
12. Open `/admin/content`.
13. Add, edit, and delete content from the admin page.

## Team Work Split

Afik:

1. MVC server migration.
2. MongoDB connection setup.
3. User model migration.
4. Content model migration.
5. Admin content CRUD.
6. My List feature.
7. Project documentation and final checklist.

Shilat:

1. Mood-based recommendations.
2. Profile model migration.
3. Reviews and ratings feature.
4. Profile page fallback fixes.
5. Profile selection page polish.

## Notes

The server uses short English code comments where the logic is important.
The current architecture separates routes, controllers, models, middleware, views, and public assets.
