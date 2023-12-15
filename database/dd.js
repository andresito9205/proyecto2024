const mysql = require('mysql');

let connection;

function getDatabaseConnection() {
    if (!connection) {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tabla'
        });
    }

    return connection;
}

module.exports = getDatabaseConnection;
