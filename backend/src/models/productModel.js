const db = require('../config/mysql');

const productModel = {
    getFiltered: async (params) => {
        let sql = `SELECT * FROM Products WHERE 1=1`;
        let queryParams = [];

        // Tìm kiếm theo tên hoặc mô tả
        if (params.search) {
            sql += ` AND (ProductName LIKE ? OR Description LIKE ?)`;
            queryParams.push(`%${params.search}%`, `%${params.search}%`);
        }

        // Lọc theo địa điểm
        if (params.location) {
            sql += ` AND Origin = ?`;
            queryParams.push(params.location);
        }

        // Lọc theo khoảng giá
        if (params.priceFrom !== null) {
            sql += ` AND Price >= ?`;
            queryParams.push(params.priceFrom);
        }
        if (params.priceTo !== null) {
            sql += ` AND Price <= ?`;
            queryParams.push(params.priceTo);
        }

        // Sắp xếp thứ tự (Sort)
        if (params.sortBy === 'asc') {
            sql += ` ORDER BY Price ASC`;
        } else if (params.sortBy === 'desc') {
            sql += ` ORDER BY Price DESC`;
        } else if (params.sortBy === 'name') {
            sql += ` ORDER BY ProductName ASC`;
        } else {
            sql += ` ORDER BY CreatedAt DESC`; // Mặc định: newest
        }

        // Phân trang bằng LIMIT và OFFSET
        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(params.perPage, params.offset);

        // Thực thi câu lệnh
        const [rows] = await db.query(sql, queryParams);
        return rows;
    },

    countFiltered: async (params) => {
        let sql = `SELECT COUNT(*) as total FROM Products WHERE 1=1`;
        let queryParams = [];

        if (params.search) {
            sql += ` AND (ProductName LIKE ? OR Description LIKE ?)`;
            queryParams.push(`%${params.search}%`, `%${params.search}%`);
        }
        if (params.location) {
            sql += ` AND Origin = ?`;
            queryParams.push(params.location);
        }
        if (params.priceFrom !== null) {
            sql += ` AND Price >= ?`;
            queryParams.push(params.priceFrom);
        }
        if (params.priceTo !== null) {
            sql += ` AND Price <= ?`;
            queryParams.push(params.priceTo);
        }

        const [result] = await db.query(sql, queryParams);
        return result[0].total; // Trả về một con số (Ví dụ: 45)
    },

    getProductById: async (id) => {
        const [rows] = await db.query('SELECT * FROM products WHERE ProductID = ?', [id]);
        return rows[0];
    },
};

module.exports = productModel;