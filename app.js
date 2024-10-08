// Library Manager app

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./models').sequelize;
const app = express();

app.set('view engine', 'pug');
app.use('/static', express.static('public'));

// Support HTTP request parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Synchronize Sequelize models and database
sequelize.sync();

// Define routes
const bookRoutes = require('./routes/books');
app.use(bookRoutes);

// Root - redirects to list all books
app.get('/', (req, res) => {
  res.redirect('/books');
});

// Intentionally throw an error to display the Server Error page
app.get('/server-error', (req, res) => {
  const status = 599;
  const message = new Error('The route intentionally returns a 599 error');
  const title = "Server Error";
  res.render('error', { status, message, title });
});

// Capture undefined routes to show a 404 error
app.use((req, res) => {
  res.render('page-not-found', { title: "Page Not Found" });
});

// Catch errors thrown by app for any request and route
app.use((err, req, res, next) => {
  // Pass to the error page the HTTP status 
  // or the teapot status if outside of expected status range
  res.locals.status = 
    (err.status >= 100 && err.status < 600) ? err.status : 418;
  res.locals.message = err;
  res.locals.title = "Server Error";
  res.render('error');
});

// Export the app instance
module.exports = app;
