const mysql = require('mysql2/promise');

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
        });

        console.log('Database connection established successfully.');
        return connection;
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

module.exports = connectToDatabase();