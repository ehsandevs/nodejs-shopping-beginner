const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // rendering the view and send page title
    // " path: '/admin/add-product' " is for cheking and set active class to menu item
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        productCSS: true,
        formCSS: true,
        activeShop: true
    });
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        // rendering the view and send products array and page title
        // " path: '/' " is for cheking and set active class to menu item 
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    });
}