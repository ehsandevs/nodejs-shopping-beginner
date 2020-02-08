const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // rendering the view and send page title
    // " path: '/admin/edit-product' " is for cheking and set active class to menu item
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
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

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        // rendering the view and send page title
        // " path: '/admin/edit-product' " is for cheking and set active class to menu item
        res.render('admin/edit-product', {
            pageTitle: 'edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    });
};

exports.postEditProduct = (req, res, next) => {

}

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