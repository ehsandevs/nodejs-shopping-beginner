const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');
// for Handling payment
const request = require('request-promise');

const ITEMS_PER_PAGE = 2;

exports.getIndex = (req, res, next) => {
    // Plus is to make sure it's a number
    // so page + 1, won't be i.e 11 -- LOL
    // || is to make sure first page always loads on default
    const page = +req.query.page || 1;
    let totalItems;

    Product.count()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.findAll({
                limit: ITEMS_PER_PAGE,
                offset: ((page - 1) * ITEMS_PER_PAGE)
            });
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProducts = (req, res, next) => {
    // Plus is to make sure it's a number
    // so page + 1, won't be i.e 11 -- LOL
    // || is to make sure first page always loads on default
    const page = +req.query.page || 1;
    let totalItems;

    Product.count()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.findAll({
                limit: ITEMS_PER_PAGE,
                offset: ((page - 1) * ITEMS_PER_PAGE)
            });
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProduct = (req, res, next) => {
    const paramId = req.params.productId;

    Product.findByPk(paramId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getCart = (req, res, next) => {
    req.user.getCart({ include: ['products'] })
        .then(cart => {
            return cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products
                    });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            let product;
            // first two IF satements are for checking the cart for existing similar product
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            // if there was no product with simiar ID, we just add it from DB
            return Product.findByPk(prodId);
        })
        .then(product => {
            // It adds product, and if it exists,
            // it just adds new quantity
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

// Deleting a product from cart
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

// checkout page
exports.getCheckout = (req, res, next) => {

    req.user.getCart({ include: ['products'] })
        .then(cart => {
            total = 0;
            products = cart.products;
            products.forEach(p => {
                total += p.cartItem.quantity * p.price;
            })
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products: products,
                totalSum: total
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

// redirecting to zarrinpal gateway to pay
exports.postCheckout = (req, res, next) => {
    let products;
    let total;
    req.user.getCart({ include: ['products'] })
        .then(cart => {
            total = 0;
            products = cart.products;
            products.forEach(p => { total += p.cartItem.quantity * p.price; })

            // Sending request to zarinpal gateway
            let params = {
                MerchantID: '6a69819e-1183-11e9-be50-005056a205be',
                Amount: total,
                CallbackURL: 'http://localhost:3000/payment/checker',
                Description: 'For Buying Products',
                Email: req.user.email
            }

            let options = {
                method: 'POST',
                uri: 'https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json',
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                body: params,
                json: true
            }

            request(options)
                .then(data => {
                    // Saving payment information to database
                    const products = cart.products;

                    let orderOptions = {
                        resNumber: data.Authority,
                        paid: false,
                        price: total
                    }

                    return req.user.createOrder(orderOptions)
                        .then(order => {
                            order.addProducts(products.map(product => {
                                product.orderItem = { quantity: product.cartItem.quantity };
                                return product;
                            }))
                        })
                        .then(result => {
                            cart.setProducts(null);
                            // res.json(data);
                            res.redirect(`https://www.zarinpal.com/pg/StartPay/${data.Authority}`);
                        });
                })
                .catch(err => {
                    next(err);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

// Validating the payment
exports.checker = (req, res, next) => {

    Order.findOne({
            where: { resNumber: req.query.Authority }
        })
        .then(order => {
            if (!order) {
                return res.render('shop/checker', {
                    pageTitle: 'Payment Error',
                    path: '/checker',
                    errorMessage: 'No Order Found!'
                });
            }

            let params = {
                MerchantID: '6a69819e-1183-11e9-be50-005056a205be',
                Amount: order.price,
                Authority: req.query.Authority
            }

            let options = {
                method: 'POST',
                uri: 'https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json',
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                body: params,
                json: true
            }
            request(options)
                .then(data => {
                    if (data.Status == 100) {
                        order.paid = true;
                        order.save();
                        res.render('shop/checker', {
                            pageTitle: 'Payment Error',
                            path: '/checker',
                            errorMessage: '$ Payment was Successful! $'
                        });
                    }
                })
                .catch(err => {
                    res.render('shop/checker', {
                        pageTitle: 'Payment Error',
                        path: '/checker',
                        errorMessage: 'Payment was Unsuccessful!'
                    });
                });
        })
}

// Getting Orders
exports.getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

// Downloading Invoice in PDF format
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findByPk(orderId, {
            include: ['products']
        })
        .then(order => {
            if (!order) {
                return next(new Error('No order found!'));
            }
            if (order.userId.toString() !== req.user.id.toString()) {
                return next(new Error('Unauthorized!'));
            }
            // only if passed these 2 checks, it may download the invoice
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            pdfDoc = new pdfDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

            // That saves in our server
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            // That is given to the user
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', { underline: true });
            pdfDoc.text('------------------------------');
            let totalPrice = 0;

            order.products.forEach(prod => {
                totalPrice += prod.orderItem.quantity * prod.price;
                pdfDoc.fontSize(14).text(
                    prod.title +
                    ' - ' +
                    prod.orderItem.quantity +
                    ' x ' +
                    '$' +
                    prod.price
                );
            });
            pdfDoc.text('------------------------------');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

            pdfDoc.end();
        }).catch(err => next(err));
}