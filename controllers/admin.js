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
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product(title, imageUrl, price, description);
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