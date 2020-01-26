// Importing express framework
const express = require('express');
// const path = require('path');

// const rootDir = require('../util/path');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// keep added products from form text field
const products = [];

// Middlewares ...
// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    // rendering the view and send page title
    // " path: '/admin/add-product' " is for cheking and set active class to menu item
    res.render('add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        productCSS: true,
        formCSS: true,
        activeShop: true
    });
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    // add inputed text in form text field, to array
    products.push({ title: req.body.title });
    res.redirect('/');
});

// Export Statements (router and products array)
exports.routes = router;
exports.products = products;