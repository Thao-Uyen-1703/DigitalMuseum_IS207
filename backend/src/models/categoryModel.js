const db = require('../config/mysql');

const categoryModel = {
    getAllCategory: async() => {
        const [rows] = await db.query('SELECT * FROM categories');
        return rows || [];       
    },

    getProductCounts: async () => {
        const [rows] = await db.query(`SELECT CategoryID, COUNT(*) as ProductCount FROM products GROUP BY CategoryID`);
        return rows || [];
    },

    getAdvanceFiltered: async (filters) => {
        let sql = `SELECT c.*, (
            SELECT COUNT(*) FROM products p WHERE p.CategoryID = c.CategoryID
        ) AS ProductCount FROM categories c WHERE 1=1`;

        const queryParams = [];

        if (filters.search) {
            sql += ` AND (c.CategoryName LIKE ? OR c.Description LIKE ?)`;
            queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.sortConfigs && Array.isArray(filters.sortConfigs) && filters.sortConfigs.length > 0) {
            const sortConditions = [];
            filters.sortConfigs.forEach(sort => {
                const dir = sort.direction === 'desc' ? 'DESC' : 'ASC';
                if (sort.key === 'CategoryName') sortConditions.push(`c.CategoryName ${dir}`);
                else if (sort.key === 'ProductCount') sortConditions.push(`ProductCount ${dir}`);
            });

            if (sortConditions.length > 0) {
                sql += ` ORDER BY ` + sortConditions.join(', ');
            } else {
                sql += ` ORDER BY c.CreatedAt DESC`;
            }
        } else {
            sql += ` ORDER BY c.CategoryID DESC`;
        }

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(filters.perPage, filters.offset || 0);

        const [rows] = await db.query(sql, queryParams);
        return rows;
    },

    countAdvanceFiltered: async (filters) => {
        let sql = `SELECT COUNT(*) as total FROM categories c WHERE 1=1`;
        const queryParams = [];

        if (filters.search) {
            sql += ` AND (c.CategoryName LIKE ? OR c.Description LIKE ?)`;
            queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const [rows] = await db.query(sql, queryParams);
        return rows[0].total || 0;
    },

    getCategoryByName: async(name) => {
        const [rows] = await db.query('SELECT CategoryName FROM categories WHERE CategoryName = ?', [name]);
        return rows[0] || null;
    },

    getCategoryByID: async(id) => {
        const [rows] = await db.query('SELECT CategoryID FROM categories WHERE CategoryID = ?', [id]);
        return rows[0] || null;
    },

    createCategory: async(data) => {
        const query = `
            INSERT INTO categories(CategoryName, Description)
            VALUES (?, ?)
        `;
        const [rows] = await db.query(query, [data.CategoryName, data.Description]);
        return rows.insertId;
    },

    updateCategory: async(id, data) => {
        const query = `
            UPDATE categories
            SET CategoryName = ?, Description = ?
            WHERE CategoryID = ?
        `;
        const [rows] = await db.query(query, [data.CategoryName, data.Description, id]);
        return rows;
    },

    existProductInCategory: async(id) => {
        const query = `
            SELECT ProductID
            FROM products
            WHERE CategoryID = ?
        `;

        const [rows] = await db.query(query, [id]);
        return rows.length > 0 ? rows : null;
    },

    deleteCategory: async(id) => {
        const query = `
            DELETE FROM categories
            WHERE CategoryID = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows || null;
    }
};

module.exports = categoryModel;