const express = require('express');
// const path = require('path');

const productsController = require('../controllers/products');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// middleware for shop
router.get('/', productsController.getProducts);

// Export Statements (router)
module.exports = router;