// Importing express Framework
const express = require('express');
// Importing body-parser, for parse incoming text from form fields
const bodyParser = require('body-parser');
const session = require('express-session');
// Importing csurf package, for CSRF attacks
const csrf = require('csurf');
const flash = require('connect-flash');

// initialize sequelize with session store
const sequelizeStore = require('connect-session-sequelize')(session.Store);

//  Importing path to help give the path
//  Because Nodejs counts path from root dir of pc not the project
const path = require('path');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

// Running the Express app by adding Paranthasis: pexress()
const app = express();

// csrf middleware
const csrfProtection = csrf();

// Usings EJS view engine, and telling it to look for views in views directory
app.set('view engine', 'ejs');
app.set('views', 'views');

// Importing routing files: admin.js and shop.js
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


// Parse incoming text from forms
app.use(bodyParser.urlencoded({ extended: false }));
// making public directory accesible for static fils like css, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'my secret',
    store: new sequelizeStore({ db: sequelize }),
    resave: false,
    saveUninitialized: false
}));

// Using the csrf middleware
// note that it should be after using session middleware
app.use(csrfProtection);
app.use(flash());

// This is topper from other Routes, which means, all routes can use it
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

// locals is for local variable which passes into the views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// /admin is the path filtering, so every route in adminRouter, starts with /admin/...
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

// middleware for wrong address
app.use(errorController.get404);

// Error Handling middleware
app.use((error, req, res, next) => {
    res.redirect('/500');
})

// Tables Associations
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product); // Optional
User.hasOne(Cart);
Cart.belongsTo(User); // Optional
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem }); // Optional
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// sequelize.sync({ force: true })
sequelize.sync()
    .then(cart => {
        // for running server on localhost:3000
        app.listen(3000);
    })
    .catch(err => console.log(err));