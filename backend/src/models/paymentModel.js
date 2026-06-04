const db = require('../config/mysql');

const paymentModel = {
    getPaymentByID: async(id) => {
        const query = `SELECT PaymentID FROM payments WHERE PaymentID = ?`;
        const [results] = await db.query(query, [id]);
        return results[0];
    },

    getPaymentByOrderID: async(orderId) => {
        const query = `
            SELECT PaymentID, Status, PaidDate, Amount, PaymentMethod
            FROM payments
            WHERE OrderID = ?
            ORDER BY PaymentID DESC
            LIMIT 1
        `;
        const [results] = await db.query(query, [orderId]);
        return results[0] || null;
    },

    createPayment: async (payment) => {
        const query = `
            INSERT INTO payments(OrderID, PaymentMethod, Amount)
            VALUES (?, ?, ?)
        `;
        const [results] = await db.query(query, [payment.OrderID, payment.PaymentMethod, payment.Amount]);
        
        return results.insertId;
    },

    updatePayment: async(payment) => {
        const query = `
            UPDATE payments
            SET PaymentMethod = ?, Status = ?, PaidDate = ?
            WHERE PaymentID = ?
        `;
        const [results] = await db.query(query, [payment.PaymentMethod, payment.Status, payment.PaidDate, payment.PaymentID]);
        return results.affectedRows;
    }
}

module.exports = paymentModel;