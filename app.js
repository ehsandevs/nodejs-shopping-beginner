// Importing express Framework
const express = require('express');
// Importing body-parser, for parse incoming text from form fields
const bodyParser = require('body-parser');
//  Importing path to help give the path
//  Because Nodejs counts path from root dir of pc not the project
const path = require('path');

const errorController = require('./controllers/error');
const db = require('./util/database');

// Running the Express app by adding Paranthasis: pexress()
const app = express();

// Usings EJS view engine, and telling it to look for views in views directory
app.set('view engine', 'ejs');
app.set('views', 'views');

// Importing routing files: admin.js and shop.js
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db.execute('SELECT * FROM products')
//     .then(result => {
//         console.log(result[0]);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// Parse incoming text from forms
app.use(bodyParser.urlencoded({ extended: false }));
// making public directory accesible for static fils like css, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// /admin is the path filtering, so every route in adminRouter, starts with /admin/...
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// middleware for wrong address
app.use(errorController.get404);

// for running server on localhost:3000
app.listen(3000);