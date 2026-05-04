const db = require('../config/mysql');

const diadiemModel = {
    // Lấy toàn bộ danh sách địa điểm
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM locations');
        return rows;
    },

    // Lấy sản phẩm theo id
    getLocationById: async (id) => {
        const [rows] = await db.query('SELECT * FROM locations WHERE LocationID = ?', [id]);
        return rows[0];
    },
};

module.exports = diadiemModel;