const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse incoming text from forms
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/add-product', (req, res, next) => {
    res.send('<form action="/product" method="POST"><input type="text" name="title"></input><button type="submit">Add Product</button></form>');
});

// only for POST methods
app.post('/product', (req, res, next) => {
    console.log(req.body);
    res.redirect('/');
});

app.use('/', (req, res, next) => {
    res.send('<h1>Hello from Express.js</h1>');
});

// for running server on localhost:3000
app.listen(3000);