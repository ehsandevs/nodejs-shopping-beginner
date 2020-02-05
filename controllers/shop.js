const Product = require('../models/product');

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

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart'
    });
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