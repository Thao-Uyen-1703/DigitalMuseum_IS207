const db = require('../config/mysql');

const productModel = {
    // Lấy toàn bộ danh sách sản phẩm
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM products');
        return rows;
    },

    // Lấy sản phẩm theo id
    getProductById: async (id) => {
        const [rows] = await db.query('SELECT * FROM products WHERE ProductID = ?', [id]);
        return rows[0];
    },
};

module.exports = productModel;