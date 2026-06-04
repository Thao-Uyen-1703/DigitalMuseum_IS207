const orderModel = require('../../models/orderModel');
const paymentModel = require('../../models/paymentModel');
const shipmentModel = require('../../models/shipmentModel');

const orderSyncService = {
    calculateOrderStatus: (payment, shipment) => {
        if (!payment) return 'Pending';
        if (payment.Status !== 'Paid') return 'Pending';
        if (!shipment) return 'Processing';
        return shipment.Status; // Shipped or Delivered
    },

    syncOrderAfterPaymentUpdate: async (orderId, newPaymentStatus) => {
        const order = await orderModel.getOrderByIdAdmin(orderId);
        if (!order) throw { status: 404, message: 'Đơn hàng không tồn tại' };

        const payment = await paymentModel.getPaymentByOrderID(orderId);
        const shipment = await shipmentModel.getShipmentByOrderID(orderId);

        const expected = orderSyncService.calculateOrderStatus(payment, shipment);

        if (order.Status !== expected) {
            const updateData = {
                UserID: order.UserID,
                AddressID: order.AddressID,
                OrderDate: order.OrderDate,
                GuestDetails: order.GuestDetails,
                OrderTracking: order.OrderTracking,
                TotalAmount: order.TotalAmount,
                Status: expected,
                Note: order.Note
            };

            await orderModel.updateOrder(orderId, updateData);
            return { synced: true, oldStatus: order.Status, newStatus: expected };
        }

        return { synced: false, currentStatus: order.Status };
    },

    syncOrderAfterShipmentUpdate: async (orderId, newShipmentStatus) => {
        const order = await orderModel.getOrderByIdAdmin(orderId);
        if (!order) throw { status: 404, message: 'Đơn hàng không tồn tại' };

        const payment = await paymentModel.getPaymentByOrderID(orderId);
        if (!payment || payment.Status !== 'Paid') {
            throw { status: 400, message: 'Không thể cập nhật vận chuyển khi thanh toán chưa hoàn tất' };
        }

        const shipment = await shipmentModel.getShipmentByOrderID(orderId);
        const expected = orderSyncService.calculateOrderStatus(payment, shipment);

        if (order.Status !== expected) {
            const updateData = {
                UserID: order.UserID,
                AddressID: order.AddressID,
                OrderDate: order.OrderDate,
                GuestDetails: order.GuestDetails,
                OrderTracking: order.OrderTracking,
                TotalAmount: order.TotalAmount,
                Status: expected,
                Note: order.Note
            };

            await orderModel.updateOrder(orderId, updateData);
            return { synced: true, oldStatus: order.Status, newStatus: expected };
        }

        return { synced: false, currentStatus: order.Status };
    }
};

module.exports = orderSyncService;
