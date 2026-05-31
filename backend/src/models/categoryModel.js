const db = require('../config/mysql');

const categoryModel = {
    getAllCategory: async() => {
        const [rows] = await db.query('SELECT * FROM categories');
        return rows || [];       
    }
};

module.exports = categoryModel;