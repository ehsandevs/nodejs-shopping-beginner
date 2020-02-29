// Importing express Framework
const express = require('express');
// Importing body-parser, for parse incoming text from form fields
const bodyParser = require('body-parser');
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

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

// /admin is the path filtering, so every route in adminRouter, starts with /admin/...
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// middleware for wrong address
app.use(errorController.get404);

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
    .then(result => {
        return User.findByPk(1);
        // console.log(result);
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Amir Ehsan', email: 'niamileo@gmail.com' });
        }
        return user;
    })
    .then(user => {
        // console.log(user);
        return user.createCart();
    })
    .then(cart => {
        // for running server on localhost:3000
        app.listen(3000);

    })
    .catch(err => { console.log(err) });