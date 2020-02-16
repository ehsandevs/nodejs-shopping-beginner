const mysql = require('mysql2');

// Each query needs a sinqle connection to DB
// pool provides multiple connections for multiple queries
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: '7731228'
});

module.exports = pool.promise();