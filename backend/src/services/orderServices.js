const orderModel = require('../models/orderModel');

const orderServices = {
    getUserOrders: async (id) => {
        const orders = await orderModel.getUserOrders(id);

        return orders;
    },

    getOrderDetails: async (trackNum, user) => {
        const order = await orderModel.getOrderByTracking(trackNum);

        if (!order) {
            throw { status: 404, message: "Không tìm thấy đơn hàng!" };
        }

        if (order.UserID !== user) {
            throw { status: 403, message: "Bạn không có quyền xem đơn hàng này!" };
        }

        const [address, products, coupon, payment, shipment] = await Promise.all([
            orderModel.getOrderAddress(order.AddressID),
            orderModel.getOrderDetails(order.OrderID),
            order.CouponID ? orderModel.getOrderCoupon(order.CouponID) : Promise.resolve(null),
            orderModel.getOrderPayment(order.OrderID),
            orderModel.getOrderShipment(order.OrderID)
        ]);

        return {
            OrderTracking: order.OrderTracking,
            Status: order.Status,
            TotalAmount: order.TotalAmount,
            OrderDate: order.OrderDate,
            Note: order.Note,
            orderInfo: {
                Name: address.ReceiverName,
                Phone: address.Phone,
                Address: `${address.AddressLine}, ${address.District}, ${address.City}`
            },
            items: products.map(item => ({
                Name: item.ProductName,
                Quantity: item.Quantity,
                Price: item.UnitPrice,
                Total: item.Total,
                Image: item.ImageURL
            })),
            Payment: payment,
            Shipment: shipment,
            Coupon: coupon
        };

        
    }
};

module.exports = orderServices;