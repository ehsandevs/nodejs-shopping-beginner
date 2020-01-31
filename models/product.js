const products = []

module.exports = class Product {

    constructor(t) {
        this.title = t;
    }

    save() {
        products.push(this);
    }

    // static means, you can call this method just from class, 
    // not instantiated object of the class
    static fetchAll() {
        return products;
    }
}