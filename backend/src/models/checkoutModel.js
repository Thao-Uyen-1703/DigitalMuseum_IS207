const db = require('../config/mysql');

const checkoutModel = {
    // Lấy thông tin đơn giá của sản phẩm để tính tổng tiền
    getProductsPrices: async (productIds) => {
        // Giả định bảng của bạn tên là 'products' và có cột 'ProductID', 'Price'
        const [rows] = await db.query(
            `SELECT ProductID, Price AS UnitPrice FROM products WHERE ProductID IN (?)`,
            [productIds]
        );
        return rows;
    },

    // Kiểm tra địa chỉ của user đã tồn tại chưa
    findUserAddress: async (userId, addressLine, district, city) => {
        const [rows] = await db.query(
            `SELECT AddressID FROM useraddresses 
             WHERE UserID = ? AND AddressLine = ? AND District = ? AND City = ? 
             LIMIT 1`,
            [userId, addressLine, district, city]
        );
        return rows.length > 0 ? rows[0] : null;
    },

    // Tạo địa chỉ mới cho user
    createUserAddress: async (data) => {
        const [result] = await db.query(
            `INSERT INTO useraddresses (UserID, ReceiverName, Phone, AddressLine, District, City, Country, isDefault) 
             VALUES (?, ?, ?, ?, ?, ?, 'Vietnam', 0)`,
            [data.userId, data.fullName, data.phone, data.addressLine, data.district, data.city]
        );
        return result.insertId;
    },

    // Kiểm tra phương thức vận chuyển
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

    // Xử lý ghi dữ liệu đơn hàng bằng Transaction
    createOrderTransaction: async (orderData) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Lưu thông tin vào bảng orders
            const OrderTracking = this.generateTrackingNumber();
            const [orderResult] = await connection.query(
                `INSERT INTO orders (UserID, AddressID, CouponID, GuestDetails, OrderTracking, TotalAmount, Status) 
                 VALUES (?, ?, NULL, ?, ?, ?, 'Pending')`,
                [
                    orderData.userId, 
                    orderData.addressId, 
                    orderData.guestDetails,
                    OrderTracking,
                    orderData.totalAmount
                ]
            );
            const orderId = orderResult.insertId;

            // 2. Lưu thông tin vào bảng orderdetails
            // Format data thành mảng 2 chiều để insert nhiều dòng cùng lúc
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

            // 3. Lưu thông tin vào bảng shipments
            await connection.query(
                `INSERT INTO shipments (OrderID, ShippingMethodID, TrackingNumber, ShippedDate, DeliveredDate) 
                 VALUES (?, ?, NULL, NULL, NULL)`,
                [orderId, orderData.shippingMethodId]
            );

            // 4. Lưu thông tin bảng payments
            await connection.query(
                `INSERT INTO payments (OrderID, PaymentMethod, PaymentStatus) 
                 VALUES (?, ?, 'Pending')`,
                [orderId, orderData.paymentMethod]
            );

            // Xác nhận transaction
            await connection.commit();
            return OrderTracking;

        } catch (error) {
            // Có lỗi xảy ra thì hoàn tác lại toàn bộ dữ liệu vừa insert
            await connection.rollback();
            throw error;
        } finally {
            // Trả connection lại cho pool
            connection.release();
        }
    }
};

module.exports = checkoutModel;