const shipmentModel = require('../../models/shipmentModel');
const orderModel = require('../../models/orderModel');

const shipmentServices = {
    createShipment: async(shipment) => {
        const order = await orderModel.getOrderByIdAdmin(shipment.OrderID);

        if(!order) {
            throw { status: 400, message: "Đơn hàng không tồn tại" }
        }

        const payload = {
            OrderID: shipment.OrderID,
            ShippingMethodID: shipment.ShippingMethodID,
            TrackingNumber: shipment.TrackingNumber,
            Status: shipment.Status,
            ShippedDate: shipment.ShippedDate,
            DeliveredDate: shipment.DeliveredDate
        }

        const results = await shipmentModel.createShipment(payload);
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
    },
};

module.exports = shipmentServices;