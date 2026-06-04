const paymentModel = require('../../models/paymentModel');
const orderModel = require('../../models/orderModel');
const orderSyncService = require('./orderSyncService');

const paymentServices = {
    createPayment: async(payment) => {
        const order = await orderModel.getOrderByIdAdmin(payment.OrderID);

        if(!order) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        const payload = {
            OrderID: payment.OrderID,
            PaymentMethod: payment.PaymentMethod,
            Amount: order.TotalAmount
        }

        const paymentId = await paymentModel.createPayment(payload);

        return { PaymentID: paymentId, ...payload };
    },

    updatePayment: async(id, payment) => {
        const order = await orderModel.getOrderByIdAdmin(payment.OrderID);
        const existPayment = await paymentModel.getPaymentByID(id);

        if(!order) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        if(!existPayment) {
            throw { status: 400, message: "Thanh toán không tồn tại" }
        }

        const payload = {
            PaymentID: id,
            PaymentMethod: payment.PaymentMethod,
            Status: payment.Status,
            PaidDate: payment.PaidDate
        }

        const results = await paymentModel.updatePayment(payload);

        // Sync order status after payment update
        let syncResult = null;
        try {
            syncResult = await orderSyncService.syncOrderAfterPaymentUpdate(payment.OrderID, payment.Status);
        } catch (err) {
            // log but don't block
            console.error('Order sync after payment failed:', err);
        }

        return { updated: results > 0, payment: payload, orderSync: syncResult };
    }
};

module.exports = paymentServices;