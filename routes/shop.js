const express = require('express');
// const path = require('path');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// middleware for shop
router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.get('/cart', isAuth, shopController.getCart);
router.get('/checkout', isAuth, shopController.getCheckout);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);
router.get('/shop/postCheckout', isAuth, shopController.postCheckout);
router.get('/payment/checker', isAuth, shopController.checker);

// Export Statements (router)
module.exports = router;