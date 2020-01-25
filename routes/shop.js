const express = require('express');
const path = require('path');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('shop', { prods: adminData.products, pageTitle: 'Shopping', path: '/' });
});

module.exports = router;