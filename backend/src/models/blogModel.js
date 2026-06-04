const db = require('../config/mysql');

const blogModel = {
    getBlogs: async (filters) => {
        let sql = `
            SELECT
                p.ProductID,
                p.ProductName,
                p.ImageURL,
                p.CulturalStory,
                p.Details,
                COUNT(v.ProductID) AS ViewCount
            FROM Products p
            LEFT JOIN userviewhistory v
                ON v.ProductID = p.ProductID
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            sql += ` AND p.ProductName LIKE ?`;
            params.push(`%${filters.search}%`);
        }

        sql += `
            GROUP BY p.ProductID
            ORDER BY ViewCount DESC
            LIMIT ? OFFSET ?
        `;
        params.push(filters.perPage, filters.offset);

        const [rows] = await db.query(sql, params);
        return rows;
    },

    countBlogs: async (filters) => {
        let sql = `SELECT COUNT(*) as total FROM Products WHERE 1=1`;
        const params = [];

        if (filters.search) {
            sql += ` AND ProductName LIKE ?`;
            params.push(`%${filters.search}%`);
        }

        const [rows] = await db.query(sql, params);
        return rows[0].total;
    },

    updateBlogDetails: async (id, data) => {
        const sql = `UPDATE Products SET CulturalStory = ?, Details = ? WHERE ProductID = ?`;
        const [result] = await db.query(sql, [data.CulturalStory, data.Details, id]);
        return result;
    }
};

module.exports = blogModel;