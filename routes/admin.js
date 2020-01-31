// Importing express framework
const express = require('express');
// const path = require('path');

const productsController = require('../controllers/products');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// Middlewares ...
// /admin/add-product => GET
router.get('/add-product', productsController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', productsController.postAddProduct);

// Export router
module.exports = router;