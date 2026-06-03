const paymentModel = require('../../models/paymentModel');
const orderModel = require('../../models/orderModel');

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

        const results = await paymentModel.createPayment(payload);

        return results;
    },

    updatePayment: async(id, payment) => {
        const order = orderModel.getOrderByIdAdmin(payment.OrderID);
        const existPayment = paymentModel.getPaymentByID(id);

        if(!order) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        if(!existPayment) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        const payload = {
            PaymentID: id,
            PaymentMethod: payment.PaymentMethod,
            Status: payment.Status,
            PaidDate: payment.PaidDate
        }

        const results = await paymentModel.updatePayment(payload);

        return results;
    }
};

module.exports = paymentServices;