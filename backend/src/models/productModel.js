const db = require('../config/mysql');

const productModel = {
    getFiltered: async (params) => {
        let sql = `SELECT DISTINCT p.* FROM Products p`;
        let queryParams = [];

        if (params.location) {
            sql += `
                JOIN ProductLocations pl ON p.ProductID = pl.ProductID
                JOIN Locations l ON pl.LocationID = l.LocationID
            `;
        }

        sql += ` WHERE 1=1`;

        // Tìm kiếm theo tên hoặc mô tả
        if (params.search) {
            sql += ` AND (ProductName LIKE ?)`;
            queryParams.push(`%${params.search}%`);
        }

        // Lọc theo địa điểm
        if (params.location) {
            sql += ` AND l.LocationName = ?`;
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
        let sql = `SELECT COUNT(DISTINCT p.ProductID) as total FROM Products p`;
        let queryParams = [];

        if (params.location) {
            sql += `
                JOIN ProductLocations pl ON p.ProductID = pl.ProductID
                JOIN Locations l ON pl.LocationID = l.LocationID
            `;
        }

        sql += ` WHERE 1=1`;

        if (params.search) {
            sql += ` AND (ProductName LIKE ?)`;
            queryParams.push(`%${params.search}%`);
        }
        if (params.location) {
            sql += ` AND l.LocationName = ?`;
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
        return result[0].total;
    },

    getProductBySlug: async (slug) => {
        const [rows] = await db.query('SELECT * FROM products WHERE SlugName = ?', [slug]);
        return rows[0];
    },

    getProductById: async (id) => {
        const [rows] = await db.query('SELECT * FROM Products WHERE ProductID = ?', [id]);
        return rows[0];
    },

    getReviewList: async (id) => {
        const query = `
            SELECT 
                u.FullName, 
                r.Comment, 
                r.Rating, 
                r.ReviewDate 
            FROM Reviews r
            INNER JOIN Users u ON r.UserID = u.UserID
            WHERE r.ProductID = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows;
    },

    getCategoryInfo: async (id) => {
        const [rows] = await db.query('SELECT CategoryName, Description FROM categories WHERE CategoryID = ?', [id]);
        return rows[0];
    },

    getLocationInfo: async (id) => {
        const [rows] = await db.query('SELECT LocationName, Details, ThumbnailURL FROM Locations WHERE LocationID = ?', [id]);
        return rows[0];
    },

    getProductsCount: async() => {
        const [rows] = await db.query('SELECT Count(*) as total FROM products');
        return rows[0].total || 0;
    },

    getProductsCountByStatus: async(status) => {
        const [rows] = await db.query('SELECT Count(*) as total FROM products WHERE IsActive = ?', [status]);
        return rows[0].total || 0;
    }
};

module.exports = productModel;