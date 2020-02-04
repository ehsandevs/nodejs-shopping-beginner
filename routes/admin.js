// Importing express framework
const express = require('express');
// const path = require('path');

const adminController = require('../controllers/admin');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// Middlewares ...
// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// Export router
module.exports = router;