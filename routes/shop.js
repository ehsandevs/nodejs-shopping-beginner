const express = require('express');
// const path = require('path');

const shopController = require('../controllers/shop');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// middleware for shop
router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.post('/create-order', shopController.postOrder);
router.get('/orders', shopController.getOrders);
router.get('/checkout', shopController.getCheckout);

// Export Statements (router)
module.exports = router;