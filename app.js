const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Parse incoming text from forms
app.use(bodyParser.urlencoded({ extended: false }));

// /admin is the path filtering, so every route in adminRouter, starts with /admin/...
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).send('<h1>Page Not Found!</h1>');
});

// for running server on localhost:3000
app.listen(3000);