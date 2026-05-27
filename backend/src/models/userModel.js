const db = require('../config/mysql');

const userModel = {
    getUsers: async() => {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    },

    getUsersCount: async() => {
        const [rows] = await db.query('SELECT Count(*) as total FROM users');
        return rows[0].total || 0;
    },

    getUsersCountByMonth: async(month, year) => {
        const query = `
            SELECT Count(*) as total
            FROM users
            WHERE YEAR(CreatedAt) = ?
            AND MONTH(CreatedAt) = ?
        `;

        const [rows] = await db.execute(query, [year, month]);
        return rows[0].total || 0;
    },
 
    getUsersCountByDateRange: async(startDate, endDate) => {
        const query = `
            SELECT Count(*) as total
            FROM users
            WHERE CreatedAt BETWEEN ? AND ?
        `;

        const [rows] = await db.execute(query, [startDate, endDate]);
        return rows[0].total || 0;
    }
};

module.exports = userModel;