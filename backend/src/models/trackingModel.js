const db = require('../config/mysql');

const trackingModel = {
    getGuestOrder: async(code) => {
        const query = `
            SELECT 
                o.OrderID, o.OrderDate, o.OrderTracking, o.Status
            FROM orders o
            WHERE o.OrderTracking = ?
            LIMIT 1
        `;
        const [rows] = await db.query(query, [code]);
        return rows.length > 0 ? rows[0] : null;
    },

    getGuestPayment: async(id) => {
        const query = `
            SELECT
                p.PaymentMethod, p.PaidDate, p.Amount
            FROM payments p
            WHERE p.OrderID = ?
            ORDER BY p.PaymentID DESC 
            LIMIT 1
        `;
        const [rows] = await db.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    },

    getGuestShipment: async(id) => {
        const query = `
            SELECT
                s.TrackingNumber, s.ShippedDate, s.DeliveredDate
            FROM shipments s
            WHERE s.OrderID = ?
            ORDER BY s.ShipmentID DESC 
            LIMIT 1
        `;
        const [rows] = await db.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = trackingModel;