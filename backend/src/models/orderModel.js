const db = require('../config/mysql');

const orderModel = {
    getUserOrders: async (id) => {
        const query = `
            SELECT OrderDate, OrderTracking, TotalAmount, Status
            FROM orders
            WHERE UserID = ?
        `;
        const [results] = await db.query(query, [id]);
        return results || [];
    },

    getOrderByTracking: async (trackNum) => {
        const [results] = await db.query('SELECT * FROM orders WHERE OrderTracking = ?', [trackNum]);
        return results[0] || null;
    },

    getOrderAddress: async(id) => {
        const query = `
            SELECT ReceiverName, Phone, AddressLine, District, City
            FROM useraddresses
            WHERE AddressID = ?
        `;
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    },

    getOrderDetails: async (id) => {
        const query = `
            SELECT p.ProductName, od.Quantity, p.ImageURL, od.UnitPrice, (od.Quantity * od.UnitPrice) AS Total
            FROM orderdetails od
            INNER JOIN products p ON p.ProductID = od.ProductID
            WHERE od.OrderID = ?
        `
        const [results] = await db.query(query, [id]);
        return results || [];
    },

    getOrderCoupon: async (id) => {
        const query = `
            SELECT Code, DiscountPercent
            FROM Coupons
            WHERE CouponID = ?
        `;
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    },

    getOrderPayment: async (id) => {
        const query = `
            SELECT PaymentMethod, PaidDate
            FROM payments
            WHERE OrderID = ?
            ORDER BY PaidDate desc
        `
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    },

    getOrderShipment: async (id) => {
        const query = `
            SELECT sm.MethodName, s.TrackingNumber, s.ShippedDate, s.DeliveredDate
            FROM shipments s
            INNER JOIN shippingmethods sm ON sm.ShippingMethodID = s.ShippingMethodID
            WHERE s.OrderID = ?
        `;
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    },

    getOrdersFilter: async ({ offset, perPage, search, sortConfigs }) => {
        const queryParts = [];
        const params = [];

        let baseQuery = `
            SELECT
                o.OrderID,
                o.OrderTracking,
                u.FullName,
                o.ShippingInfo,
                o.Note,
                o.OrderDate,
                o.TotalAmount,
                o.Status as OrderStatus,
                p.PaymentID,
                p.PaymentMethod,
                p.Status as PaymentStatus,
                sm.MethodName,
                s.ShipmentID,
                s.TrackingNumber,
                s.CreateAt,
                s.Status as ShipmentStatus,
                s.ShippedDate,
                s.DeliveredDate
            FROM orders o
            LEFT JOIN users u ON u.UserID = o.UserID
            LEFT JOIN Payments p ON p.OrderID = o.OrderID
            LEFT JOIN Shipments s on s.OrderID = o.OrderID
            LEFT JOIN ShippingMethods sm on sm.ShippingMethodID = s.ShippingMethodID
            WHERE 1=1
        `;

        if (search) {
            baseQuery += ` AND (
                o.OrderTracking LIKE ? OR
                u.FullName LIKE ? OR
            )`;
            const searchValue = `%${search}%`;
            params.push(searchValue, searchValue);
        }

        if (Array.isArray(sortConfigs) && sortConfigs.length > 0) {
            const orderClauses = [];
            sortConfigs.forEach((sort) => {
                const direction = sort.direction === 'desc' ? 'DESC' : 'ASC';
                if (sort.key === 'OrderDate') {
                    orderClauses.push(`o.OrderDate ${direction}`);
                } else if (sort.key === 'Status') {
                    orderClauses.push(`o.Status ${direction}`);
                } else if (sort.key === 'TotalAmount') {
                    orderClauses.push(`o.TotalAmount ${direction}`);
                }
            });
            if (orderClauses.length > 0) {
                baseQuery += ` ORDER BY ${orderClauses.join(', ')}`;
            }
        } else {
            baseQuery += ` ORDER BY o.OrderDate DESC`;
        }

        baseQuery += ` LIMIT ?, ?`;
        params.push(offset, perPage);

        const [rows] = await db.query(baseQuery, params);
        return rows || [];
    },

    countOrdersFilter: async ({ search }) => {
        let query = `
            SELECT COUNT(*) as total
            FROM orders o
            LEFT JOIN users u ON u.UserID = o.UserID
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ` AND (
                o.OrderTracking LIKE ? OR
                u.FullName LIKE ? OR
            )`;
            const searchValue = `%${search}%`;
            params.push(searchValue, searchValue, searchValue, searchValue);
        }

        const [rows] = await db.query(query, params);
        return rows[0]?.total || 0;
    },

    getOrderByIdAdmin: async (id) => {
        const query = `
            SELECT
                o.*, 
                u.FullName
            FROM orders o
            LEFT JOIN users u ON u.UserID = o.UserID
            WHERE o.OrderID = ?
            LIMIT 1
        `;
        const [results] = await db.query(query, [id]);
        return results[0] || null;
    },

    createOrder: async (data) => {
        const query = `
            INSERT INTO orders
                (UserID, AddressID, OrderDate, GuestDetails, OrderTracking, TotalAmount, Status, Note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            data.UserID,
            data.AddressID,
            data.OrderDate,
            data.GuestDetails,
            data.OrderTracking,
            data.TotalAmount,
            data.Status,
            data.Note
        ]);

        return result.insertId;
    },

    updateOrder: async (id, data) => {
        const query = `
            UPDATE orders SET
                UserID = ?,
                AddressID = ?,
                OrderDate = ?,
                GuestDetails = ?,
                OrderTracking = ?,
                TotalAmount = ?,
                Status = ?,
                Note = ?
            WHERE OrderID = ?
        `;

        const [result] = await db.query(query, [
            data.UserID,
            data.AddressID,
            data.OrderDate,
            data.GuestDetails,
            data.OrderTracking,
            data.TotalAmount,
            data.Status,
            data.Note,
            id
        ]);

        return result.affectedRows;
    },

    deleteOrderTransaction: async (id) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query('DELETE FROM payments WHERE OrderID = ?', [id]);
            await connection.query('DELETE FROM shipments WHERE OrderID = ?', [id]);
            await connection.query('DELETE FROM orderdetails WHERE OrderID = ?', [id]);
            await connection.query('DELETE FROM orders WHERE OrderID = ?', [id]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getOrdersCount: async () => {
        const [rows] = await db.query('SELECT Count(*) as total FROM orders');
        return rows[0].total || 0;
    },

    getOrdersCountByMonth: async(month, year) => {
        const query = `
            SELECT Count(*) as total
            FROM orders
            WHERE YEAR(OrderDate) = ?
            AND MONTH(OrderDate) = ?
        `;
        const [rows] = await db.query(query, [year, month]);
        return rows[0].total || 0;
    },

    getOrdersRevenue: async() => {
        const [rows] = await db.query(`SELECT SUM(TotalAmount) as total FROM orders WHERE Status = 'Delivered'`);
        return rows[0].total || 0;
    },

    getOrdersRevenueByMonth: async(month, year) => {
        const query = `
            SELECT SUM(TotalAmount) as total
            FROM orders
            WHERE YEAR(OrderDate) = ?
            AND Status = 'Delivered'
            AND MONTH(OrderDate) = ?
        `;
        const [rows] = await db.query(query, [year, month]);
        return rows[0].total || 0;
    },

    getOrdersRevenueByYear: async(year) => {
        const query = `
            SELECT 
                MONTH(OrderDate) AS month,
                COALESCE(SUM(TotalAmount), 0) AS revenue
            FROM orders
            WHERE YEAR(OrderDate) = ?
            AND Status = 'Delivered'
            GROUP BY MONTH(OrderDate)
            ORDER BY MONTH(OrderDate)
        `;

        const [rows] = await db.query(query, [year]);

        return rows.map(row => ({
            month: Number(row.month),
            revenue: Number(row.revenue)
        }));
    },

    getTopCategoriesBySales: async(year) => {
        const query = `
            SELECT
                c.CategoryName,
                SUM(od.Quantity) as totalQuantity
            FROM orderdetails od
            JOIN products p ON p.ProductID = od.ProductID 
            JOIN categories c ON c.CategoryID = p.CategoryID 
            JOIN orders o ON o.OrderID = od.OrderID
            WHERE o.Status = 'Delivered'
            AND YEAR(o.OrderDate) = ?
            GROUP BY c.CategoryID, c.CategoryName 
            ORDER BY totalQuantity DESC
        `;

        const [rows] = await db.query(query, [year]);

        return rows.map(item => ({
            name: item.CategoryName,
            value: Number(item.totalQuantity)
        }));
    },

    getOrders: async (num) => {
        const query = `
            SELECT 
                o.OrderID,
                o.UserID,
                o.TotalAmount,
                o.OrderDate,
                o.Status,
                o.OrderTracking,
                u.FullName
            FROM orders o
            LEFT JOIN users u ON u.UserID = o.UserID
            ORDER BY o.OrderDate DESC
            ${num ? 'LIMIT ?' : ''}
        `;

        const params = num ? [num] : [];

        const [rows] = await db.query(query, params);

        return rows;
    }
};

module.exports = orderModel;