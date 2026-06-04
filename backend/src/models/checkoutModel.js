const db = require('../config/mysql');

const checkoutModel = {
    getProductsPrices: async (productIds) => {
        const [rows] = await db.query(
            `SELECT ProductID, Price AS UnitPrice FROM products WHERE ProductID IN (?)`,
            [productIds]
        );
        return rows;
    },

    findUserAddress: async (userId, addressLine, district, city) => {
        const [rows] = await db.query(
            `SELECT AddressID FROM useraddresses 
             WHERE UserID = ? AND AddressLine = ? AND District = ? AND City = ? 
             LIMIT 1`,
            [userId, addressLine, district, city]
        );
        return rows.length > 0 ? rows[0] : null;
    },

    createUserAddress: async (data) => {
        const [result] = await db.query(
            `INSERT INTO useraddresses (UserID, ReceiverName, Phone, AddressLine, District, City, Country, isDefault) 
             VALUES (?, ?, ?, ?, ?, ?, 'Vietnam', 0)`,
            [data.userId, data.fullName, data.phone, data.addressLine, data.district, data.city]
        );
        return result.insertId;
    },

    getShippingMethod: async (methodId) => {
        const [rows] = await db.query(
            `SELECT ShippingMethodID, Price FROM shippingmethods WHERE ShippingMethodID = ? LIMIT 1`,
            [methodId]
        );
        return rows.length > 0 ? rows[0] : null;
    },

    generateTrackingNumber: () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2);
        const dateStr = `${dd}${mm}${yy}`;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomStr = '';
        for (let i = 0; i < 6; i++) {
            randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return `LCN${dateStr}${randomStr}`;
    },

    createOrderTransaction: async (orderData) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {

            const sortedItems = [...orderData.items].sort((a, b) => a.productId - b.productId);

            for (const item of sortedItems) {
                const [stockResult] = await connection.query(
                    `SELECT Stock, ProductName FROM products WHERE ProductID = ? FOR UPDATE`,
                    [item.productId]
                );

                if (stockResult.length === 0) {
                    throw { status: 404, message: `Sản phẩm (ID: ${item.productId}) không tồn tại.` };
                }

                const currentStock = stockResult[0].Stock;
                const productName = stockResult[0].ProductName;

                if (currentStock < item.quantity) {
                    throw { 
                        status: 400, 
                        message: `Sản phẩm "${productName}" chỉ còn lại ${currentStock} chiếc. Vui lòng cập nhật lại giỏ hàng.` 
                    };
                }

                await connection.query(
                    `UPDATE products SET Stock = Stock - ? WHERE ProductID = ?`,
                    [item.quantity, item.productId]
                );
            }

            const trackingNum = checkoutModel.generateTrackingNumber();

            // 1. Lưu thông tin vào bảng orders
            const [orderResult] = await connection.query(
                `INSERT INTO orders (UserID, CouponID, OrderDate, ShippingInfo, Note, OrderTracking ,TotalAmount) 
                 VALUES (?, NULL, NOW(), ?, ?, ?, ?)`,
                [
                    orderData.userId, 
                    orderData.shippingInfo,
                    orderData.note,
                    trackingNum,
                    orderData.totalAmount
                ]
            );

            const orderId = orderResult.insertId;

            const orderDetailsValues = orderData.items.map(item => [
                orderId, 
                item.productId, 
                item.quantity, 
                item.unitPrice
            ]);
            
            await connection.query(
                `INSERT INTO orderdetails (OrderID, ProductID, Quantity, UnitPrice) VALUES ?`,
                [orderDetailsValues]
            );

            await connection.query(
                `INSERT INTO shipments (OrderID, ShippingMethodID, TrackingNumber, ShippedDate, DeliveredDate) 
                 VALUES (?, ?, NULL, NULL, NULL)`,
                [orderId, orderData.shippingMethodId]
            );

            await connection.query(
                `INSERT INTO payments (OrderID, PaymentMethod, CreateAt, Amount) 
                 VALUES (?, ?, NOW(), ?)`,
                [orderId, orderData.paymentMethod, orderData.totalAmount]
            );

            await connection.commit();
            return trackingNum;

        } catch (error) {
            await connection.rollback();
            throw { status: 500, message: error };
        } finally {
            connection.release();
        }
    }
};

module.exports = checkoutModel;