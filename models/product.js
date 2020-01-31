const fs = require('fs');
const path = require('path');
const __dir = require('../util/path');
const p = path.join(__dir, 'data', 'products.json');

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product {

    constructor(t) {
        this.title = t;
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err);
            });
        });
    }

    // static means, you can call this method just from class, 
    // not instantiated object of the class
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
};