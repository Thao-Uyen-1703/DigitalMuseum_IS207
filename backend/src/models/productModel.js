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

        sql += ` WHERE 1=1 AND IsActive = 1`;

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

        if (params.sortBy === 'asc') {
            sql += ` ORDER BY Price ASC`;
        } else if (params.sortBy === 'desc') {
            sql += ` ORDER BY Price DESC`;
        } else if (params.sortBy === 'name') {
            sql += ` ORDER BY ProductName ASC`;
        } else {
            sql += ` ORDER BY CreatedAt DESC`;
        }

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(params.perPage, params.offset);

        const [rows] = await db.query(sql, queryParams);
        return rows;
    },

    getAdvanceFiltered: async (filters) => {
        let sql = `
            SELECT 
                p.ProductID, p.ProductName, p.SlugName, p.Price, p.Stock, 
                p.IsActive, p.ImageURL, p.CategoryID, p.OriginLocationID, p.Weight,
                c.CategoryName,
                l.LocationName,
                (
                    SELECT GROUP_CONCAT(pl.LocationID)
                    FROM ProductLocations pl
                    WHERE pl.ProductID = p.ProductID
                ) AS LocationIDs
            FROM Products p
            LEFT JOIN categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN Locations l ON p.OriginLocationID = l.LocationID
            WHERE 1=1
        `;
        let queryParams = [];

        if (filters.search) {
            sql += ` AND p.ProductName LIKE ?`;
            queryParams.push(`%${filters.search}%`);
        }

        if (filters.category) {
            sql += ` AND p.CategoryID = ?`;
            queryParams.push(filters.category);
        }

        if (filters.location) {
            sql += ` AND p.OriginLocationID = ?`;
            queryParams.push(filters.location);
        }

        if (filters.status === 'active') {
            sql += ` AND p.IsActive = 1`;
        } else if (filters.status === 'inactive') {
            sql += ` AND p.IsActive = 0`;
        }

        if (filters.stock === 'in_stock') {
            sql += ` AND p.Stock > 0`;
        } else if (filters.stock === 'out_of_stock') {
            sql += ` AND p.Stock <= 0`;
        }

        if (filters.sortConfigs && Array.isArray(filters.sortConfigs) && filters.sortConfigs.length > 0) {
            const sortConditions = [];
            
            filters.sortConfigs.forEach(sort => {
                const dir = sort.direction === 'desc' ? 'DESC' : 'ASC';
                if (sort.key === 'ProductName') sortConditions.push(`p.ProductName ${dir}`);
                else if (sort.key === 'Price') sortConditions.push(`p.Price ${dir}`);
                else if (sort.key === 'Stock') sortConditions.push(`p.Stock ${dir}`);
                else if (sort.key === 'IsActive') sortConditions.push(`p.IsActive ${dir}`);
            });

            if (sortConditions.length > 0) {
                sql += ` ORDER BY ` + sortConditions.join(', ');
            } else {
                sql += ` ORDER BY p.CreatedAt DESC`;
            }
        } else {
            sql += ` ORDER BY p.CreatedAt DESC`;
        }

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(filters.perPage, (filters.page - 1) * filters.perPage);

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

    getProductByName: async (name) => {
        const [rows] = await db.query('SELECT * FROM Products WHERE ProductName = ?', [name]);
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
    },

    getAllProducts: async (filters) => {
        let sql = `SELECT p.*, 
                    (
                        SELECT GROUP_CONCAT(pl.LocationID)
                        FROM ProductLocations pl
                        WHERE pl.ProductID = p.ProductID
                    ) AS LocationIDs
                   FROM Products p
                   WHERE 1=1`;
        let queryParams = [];

        if (filters.search) {
            sql += ` AND (p.ProductName LIKE ?)`;
            queryParams.push(`%${filters.search}%`);
        }

        if (filters.category) {
            sql += ` AND p.CategoryID = ?`;
            queryParams.push(filters.category);
        }

        // if (filters.isActive !== null && filters.isActive !== undefined) {
        //     sql += ` AND p.IsActive = ?`;
        //     queryParams.push(filters.IsActive ? 1 : 0);
        // }

        if (filters.sortConfigs && Array.isArray(filters.sortConfigs) && filters.sortConfigs.length > 0) {
            const sortConditions = [];
            
            filters.sortConfigs.forEach(sort => {
                const dir = sort.direction === 'desc' ? 'DESC' : 'ASC';
                if (sort.key === 'ProductName') sortConditions.push(`p.ProductName ${dir}`);
                else if (sort.key === 'Price') sortConditions.push(`p.Price ${dir}`);
                else if (sort.key === 'Stock') sortConditions.push(`p.Stock ${dir}`);
                else if (sort.key === 'IsActive') sortConditions.push(`p.IsActive ${dir}`);
            });

            if (sortConditions.length > 0) {
                sql += ` ORDER BY ` + sortConditions.join(', ');
            } else {
                sql += ` ORDER BY p.CreatedAt DESC`;
            }
        } else {
            sql += ` ORDER BY p.CreatedAt DESC`;
        }

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(filters.perPage, (filters.page - 1) * filters.perPage);

        const [rows] = await db.query(sql, queryParams);

        return rows;
    },

    countProducts: async (filters) => {
        let sql = `SELECT COUNT(*) as total FROM Products p WHERE 1=1`;
        let queryParams = [];

        if (filters.search) {
            sql += ` AND (p.ProductName LIKE ?)`;
            queryParams.push(`%${filters.search}%`);
        }

        if (filters.category) {
            sql += ` AND p.CategoryID = ?`;
            queryParams.push(filters.category);
        }

        if (filters.isActive !== null && filters.isActive !== undefined) {
            sql += ` AND p.IsActive = ?`;
            queryParams.push(filters.isActive ? 1 : 0);
        }

        const [rows] = await db.query(sql, queryParams);
        return rows[0].total || 0;
    },

    createProduct: async (productData) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const {
                ProductName,
                CategoryID,
                OriginLocationID,
                SlugName,
                CulturalStory,
                Price,
                Weight,
                Stock,
                ImageURL,
                IsActive,
                LocationIDs = []
            } = productData;

            const [productResult] = await connection.query(
                `
                INSERT INTO Products
                (
                    ProductName, CategoryID, OriginLocationID, SlugName,
                    CulturalStory, Price, Weight, Stock, ImageURL, IsActive
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    ProductName, CategoryID, OriginLocationID, SlugName,
                    CulturalStory, Price, Weight, Stock, ImageURL, IsActive
                ]
            );

            const productId = productResult.insertId;

            if (LocationIDs.length > 0) {
                const locationValues = LocationIDs.map(locationId => [productId, locationId]);
                await connection.query(
                    `INSERT INTO ProductLocations (ProductID, LocationID) VALUES ?`,
                    [locationValues]
                );
            }

            await connection.commit();
            return { ProductID: productId, ...productData };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    updateProduct: async (id, updateData) => {
        let sql = `UPDATE Products SET `;
        let queryParams = [];
        const keys = Object.keys(updateData);

        if (keys.length === 0) return null;

        keys.forEach((key, index) => {
            sql += `${key} = ?`;
            if (index < keys.length - 1) sql += ', ';
            queryParams.push(updateData[key]);
        });

        sql += ` WHERE ProductID = ?`;
        queryParams.push(id);

        const [result] = await db.query(sql, queryParams);
        return result;
    },

    updateProductLocations: async (productId, locationIds) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(`DELETE FROM ProductLocations WHERE ProductID = ?`, [productId]);

            if (locationIds && locationIds.length > 0) {
                const locationValues = locationIds.map(locationId => [productId, locationId]);
                await connection.query(
                    `INSERT INTO ProductLocations (ProductID, LocationID) VALUES ?`,
                    [locationValues]
                );
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    deleteProduct: async (id) => {
        const sql = `UPDATE Products SET IsActive = 0 WHERE ProductID = ?`;
        const [result] = await db.query(sql, [id]);
        return result;
    },

    countAdvanceFiltered: async (filters) => {
        let sql = `SELECT COUNT(DISTINCT p.ProductID) as total FROM Products p WHERE 1=1`;
        let queryParams = [];

        if (filters.search) {
            sql += ` AND p.ProductName LIKE ?`;
            queryParams.push(`%${filters.search}%`);
        }

        if (filters.category) {
            sql += ` AND p.CategoryID = ?`;
            queryParams.push(filters.category);
        }

        if (filters.status === 'active') {
            sql += ` AND p.IsActive = 1`;
        } else if (filters.status === 'inactive') {
            sql += ` AND p.IsActive = 0`;
        }

        if (filters.stock === 'in_stock') {
            sql += ` AND p.Stock > 0`;
        } else if (filters.stock === 'out_of_stock') {
            sql += ` AND p.Stock <= 0`;
        }

        const [result] = await db.query(sql, queryParams);
        return result[0].total || 0;
    },

    existSlugName: async(slug) => {
        const [rows] = await db.query('SELECT 1 FROM products WHERE SlugName = ?', [slug]);
        return rows.length > 0;
    },

    getProductLocations: async (productId) => {
        const sql = `SELECT LocationID FROM ProductLocations WHERE ProductID = ?`;
        const [rows] = await db.query(sql, [productId]);
        return rows.map(item => item.LocationID);
    }
};

module.exports = productModel;