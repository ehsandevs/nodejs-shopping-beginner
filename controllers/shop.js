const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Shop',
                path: '/products'
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

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    }));
                })
                .catch(err => console.log(err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

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
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
            //     res.send(data);
            // });

            // Straming data instead of preloading it
        }).catch(err => next(err));
}