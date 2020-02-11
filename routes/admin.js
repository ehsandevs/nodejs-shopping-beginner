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

// /admin/edit-product => GET
router.get('/edit-product/:productId', adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

// Export router
module.exports = router;