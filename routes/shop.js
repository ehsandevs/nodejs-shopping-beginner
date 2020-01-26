const express = require('express');
// const path = require('path');

// const rootDir = require('../util/path');

// Importing admin.js to access products array
const adminData = require('./admin');
// Initialize and run this file as a Router because of ()
const router = express.Router();

// middleware for shop
router.get('/', (req, res, next) => {
    // rendering the view and send products array and page title
    // " path: '/' " is for cheking and set active class to menu item 
    res.render('shop', { prods: adminData.products, pageTitle: 'Shopping', path: '/' });
});

// Export Statements (router)
module.exports = router;