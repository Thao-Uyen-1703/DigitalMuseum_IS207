const db = require('../config/mysql');

const locationModel = {
    // Lấy toàn bộ danh sách địa điểm
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM locations');
        return rows;
    },

    // Lấy địa điểm theo id
    getLocationById: async (id) => {
        const [rows] = await db.query('SELECT * FROM locations WHERE LocationID = ?', [id]);
        return rows[0];
    },

    getLocationByID: async (id) => {
        const [rows] = await db.query('SELECT LocationID FROM locations WHERE LocationID = ?', [id]);
        return rows[0] || null;
    },

    getLocationByName: async (name) => {
        const [rows] = await db.query('SELECT LocationID FROM locations WHERE LocationName = ?', [name]);
        return rows[0] || null;
    },

    getAdvanceFiltered: async (filters) => {
        let sql = `SELECT l.* FROM locations l WHERE 1=1`;
        const queryParams = [];

        if (filters.search) {
            sql += ` AND (l.LocationName LIKE ? OR l.Details LIKE ?)`;
            queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.sortConfigs && Array.isArray(filters.sortConfigs) && filters.sortConfigs.length > 0) {
            const sortConditions = [];
            filters.sortConfigs.forEach(sort => {
                const dir = sort.direction === 'desc' ? 'DESC' : 'ASC';
                if (sort.key === 'LocationName') sortConditions.push(`l.LocationName ${dir}`);
                else if (sort.key === 'LocationID') sortConditions.push(`l.LocationID ${dir}`);
            });

            if (sortConditions.length > 0) {
                sql += ` ORDER BY ` + sortConditions.join(', ');
            } else {
                sql += ` ORDER BY l.LocationID DESC`;
            }
        } else {
            sql += ` ORDER BY l.LocationID ASC`;
        }

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(filters.perPage, filters.offset || 0);

        const [rows] = await db.query(sql, queryParams);
        return rows;
    },

    countAdvanceFiltered: async (filters) => {
        let sql = `SELECT COUNT(*) as total FROM locations l WHERE 1=1`;
        const queryParams = [];

        if (filters.search) {
            sql += ` AND (l.LocationName LIKE ? OR l.Details LIKE ?)`;
            queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const [rows] = await db.query(sql, queryParams);
        return rows[0].total || 0;
    },

    createLocation: async (data) => {
        const query = `
            INSERT INTO locations (LocationName, City, Details, ThumbnailURL)
            VALUES (?, ?, ?, ?)
        `;
        const [rows] = await db.query(query, [data.LocationName, data.City || null, data.Details || null, data.ThumbnailURL || null]);
        return rows.insertId;
    },

    updateLocation: async (id, data) => {
        const query = `
            UPDATE locations
            SET LocationName = ?, City = ?, Details = ?, ThumbnailURL = ?
            WHERE LocationID = ?
        `;
        const [rows] = await db.query(query, [data.LocationName, data.City || null, data.Details || null, data.ThumbnailURL || null, id]);
        return rows;
    },

    existProductInLocation: async (id) => {
        const query = `
            SELECT ProductID
            FROM products
            WHERE OriginLocationID = ?
            UNION
            SELECT pl.ProductID
            FROM ProductLocations pl
            WHERE pl.LocationID = ?
            LIMIT 1
        `;
        const [rows] = await db.query(query, [id, id]);
        return rows.length > 0;
    },

    deleteLocation: async (id) => {
        const query = `
            DELETE FROM locations
            WHERE LocationID = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows;
    }
};

module.exports = locationModel;
