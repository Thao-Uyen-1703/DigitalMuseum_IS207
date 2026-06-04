const shipmentModel = require('../../models/shipmentModel');
const orderModel = require('../../models/orderModel');
const paymentModel = require('../../models/paymentModel');
const orderSyncService = require('./orderSyncService');

const shipmentServices = {
    createShipment: async(shipment) => {
        const order = await orderModel.getOrderByIdAdmin(shipment.OrderID);

        if(!order) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        // Validate: can only create shipment if payment exists and is paid
        const payment = await paymentModel.getPaymentByOrderID(shipment.OrderID);
        if (!payment || payment.Status !== 'Paid') {
            throw { status: 400, message: "Không thể tạo vận chuyển khi thanh toán chưa hoàn tất" };
        }

        const payload = {
            OrderID: shipment.OrderID,
            ShippingMethodID: shipment.ShippingMethodID,
            TrackingNumber: shipment.TrackingNumber,
            Status: shipment.Status || 'Pending',
            ShippedDate: shipment.ShippedDate,
            DeliveredDate: shipment.DeliveredDate
        }

        const shipmentId = await shipmentModel.createShipment(payload);

        // attempt to sync order status
        let syncResult = null;
        try {
            syncResult = await orderSyncService.syncOrderAfterShipmentUpdate(shipment.OrderID, payload.Status);
        } catch (err) {
            console.error('Order sync after create shipment failed:', err);
        }

        return { ShipmentID: shipmentId, ...payload, orderSync: syncResult };
    },

    updateShipment: async(id, shipment) => {
        const order = await orderModel.getOrderByIdAdmin(shipment.OrderID);

        if(!order) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        const existShipment = await shipmentModel.getShipmentByID(id);

        if(!existShipment) {
            throw { status: 400, message: "Mã vận chuyển không tồn tại" }
        }

        const payload = {
            ShippingMethodID: shipment.ShippingMethodID,
            TrackingNumber: shipment.TrackingNumber,
            Status: shipment.Status,
            ShippedDate: shipment.ShippedDate,
            DeliveredDate: shipment.DeliveredDate
        }

        const results = await shipmentModel.updateShipment(id, payload);

        // Sync order status after shipment update
        let syncResult = null;
        try {
            syncResult = await orderSyncService.syncOrderAfterShipmentUpdate(shipment.OrderID, shipment.Status);
        } catch (err) {
            console.error('Order sync after shipment update failed:', err);
        }

        return { updated: results > 0, shipment: payload, orderSync: syncResult };
    },
};

module.exports = shipmentServices;