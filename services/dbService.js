const mysql = require('mysql2');
const dbconfig = require('../dbconfig/dbconfig.json');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false,
});

module.exports = pool;
