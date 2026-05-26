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
    }
};

module.exports = orderModel;