const orderModel = require('../../models/orderModel');
const paymentModel = require('../../models/paymentModel');
const shipmentModel = require('../../models/shipmentModel');

const orderSyncService = {
    calculateOrderStatus: (payment, shipment) => {
        const paymentStatus = payment ? payment.Status : 'Pending';
        const shipmentStatus = shipment ? shipment.Status : 'Pending';

        // THÊM MỚI: Nếu 1 trong 2 có trạng thái lỗi/hoàn trả thì ép về Pending ngay lập tức
        const resetStatuses = ['Failed', 'Refunded', 'Returned'];
        if (resetStatuses.includes(paymentStatus) || resetStatuses.includes(shipmentStatus)) {
            return 'Pending';
        }

        // 1. Cả 2 đều hoàn tất -> Đơn hàng Completed
        if (paymentStatus === 'Paid' && shipmentStatus === 'Delivered') {
            return 'Completed';
        }

        // 2. Vận chuyển thành công nhưng chưa thanh toán (Khách mua COD) -> Delivering
        if (shipmentStatus === 'Delivered' && paymentStatus !== 'Paid') {
            return 'Delivering'; 
        }

        // 3. Đang trên đường giao (các case Failed/Returned đã bị chặn ở trên) -> Trả về đúng trạng thái
        if (shipmentStatus !== 'Pending' && shipmentStatus !== 'Shipping') {
            return shipmentStatus; 
        }

        // 4. Khách đã thanh toán trước (Banking) nhưng chưa giao hàng -> Processing
        if (paymentStatus === 'Paid' && shipmentStatus === 'Pending') {
            return 'Processing';
        }

        // 5. Mặc định khi mới tạo
        return 'Pending';
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
                ShippingInfo: order.ShippingInfo,
                OrderDate: order.OrderDate,
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
        const shipment = await shipmentModel.getShipmentByOrderID(orderId);
        
        const expected = orderSyncService.calculateOrderStatus(payment, shipment);

        if (order.Status !== expected) {
            const updateData = {
                UserID: order.UserID,
                ShippingInfo: order.ShippingInfo,
                OrderDate: order.OrderDate,
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