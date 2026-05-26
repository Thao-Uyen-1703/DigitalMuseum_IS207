const trackingModel = require('../../models/trackingModel');

const trackingServices = {
    getGuestInfo: async(code) => {
        const order = await trackingModel.getGuestOrder(code);

        if (!order) {
            throw { status: 404, message: "Không tìm thấy đơn hàng." };
        }

        const step = trackingServices.getCurrentStep(order.Status);

        let responseData = {
            step: step,
            orderCode: order.OrderTracking,
            displayInfo: {}
        };

        switch (step) {
            case 1:
                responseData.displayInfo = {
                    message: "Đơn hàng đang chờ xử lý",
                    date: order.OrderDate
                };
                break;

            case 2:
                responseData.displayInfo = {
                    message: "Đơn hàng đang được đóng gói",
                    date: order.OrderDate
                };
                break;

            case 3:
                const shipment = await trackingModel.getGuestShipment(order.OrderID);
                responseData.displayInfo = {
                    message: "Đơn hàng đang vận chuyển",
                    trackingNumber: shipment?.TrackingNumber || "Đang chờ cấp mã",
                    date: shipment?.ShippedDate || null
                };
                break;

            case 4:
                const payment = await trackingModel.getGuestPayment(order.OrderID);
                const finalShipment = await trackingModel.getGuestShipment(order.OrderID);
                
                responseData.displayInfo = {
                    message: "Giao hàng thành công",
                    date: finalShipment?.DeliveredDate || null,
                    amount: payment.Amount || 0,
                    paidDate: payment?.PaidDate || null
                };
                break;
        }

        return responseData;
    },

    getCurrentStep: (status) => {
        switch (status) {
            case 'Pending': return 1;
            case 'Processing': return 2;
            case 'Shipped': return 3;
            case 'Delivered': return 4;
            default: return 1;
        }
    }
};

module.exports = trackingServices;