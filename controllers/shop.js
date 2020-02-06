const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        // rendering the view and send products array and page title
        // " path: '/' " is for cheking and set active class to menu item 
        res.render('shop/Index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        // rendering the view and send products array and page title
        // " path: '/' " is for cheking and set active class to menu item 
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Shop',
            path: '/products'
        });
    });
};

exports.getProduct = (req, res, next) => {
    const paramId = req.params.productId;
    Product.findById(paramId, product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    });
}

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart'
    });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price);
    });
    res.redirect('/cart');
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    });
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
}