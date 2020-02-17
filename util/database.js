const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', '7731228', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;