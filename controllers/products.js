// keep added products from form text field
const products = [];

exports.getAddProduct = (req, res, next) => {
    // rendering the view and send page title
    // " path: '/admin/add-product' " is for cheking and set active class to menu item
    res.render('add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        productCSS: true,
        formCSS: true,
        activeShop: true
    });
};

exports.postAddProduct = (req, res, next) => {
    // add inputed text in form text field, to array
    products.push({ title: req.body.title });
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    // rendering the view and send products array and page title
    // " path: '/' " is for cheking and set active class to menu item 
    res.render('shop', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        productCSS: true,
        activeAddProduct: true
    });
};