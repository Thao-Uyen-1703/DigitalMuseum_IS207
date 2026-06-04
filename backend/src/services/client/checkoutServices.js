const checkoutModel = require('../../models/checkoutModel');

const checkoutServices = {
    createOrder: async (value, userId) => {
        const { items, customerInfo, shippingMethodId, paymentMethod } = value;

        // 1. Kiểm tra Shipping Method
        const shippingMethod = await checkoutModel.getShippingMethod(shippingMethodId);
        if (!shippingMethod) {
            const error = new Error("Phương thức vận chuyển không tồn tại trong hệ thống.");
            error.status = 400;
            throw error;
        }

        // 2. Lấy đơn giá sản phẩm và tính tổng tiền (TotalAmount)
        const productIds = items.map(item => item.productId);
        const productsPriceList = await checkoutModel.getProductsPrices(productIds);

        // Kiểm tra xem có sản phẩm nào bị lỗi/không tồn tại không
        if (productsPriceList.length !== items.length) {
            const error = new Error("Một hoặc nhiều sản phẩm trong giỏ hàng không tồn tại.");
            error.status = 404;
            throw error;
        }

        let totalAmount = 0;
        const itemsWithPrices = items.map(item => {
            const productInfo = productsPriceList.find(p => p.ProductID === item.productId);
            totalAmount += (productInfo.UnitPrice * item.quantity);
            return {
                ...item,
                unitPrice: productInfo.UnitPrice
            };
        });

        totalAmount += Number(shippingMethod.Price || 0);

        const { note, ...shippingInfo } = customerInfo;
        
        const orderData = {
            userId: userId || null,
            shippingInfo: JSON.stringify(shippingInfo),
            note: note,
            totalAmount,
            shippingMethodId: shippingMethod.ShippingMethodID,
            paymentMethod: paymentMethod,
            items: itemsWithPrices
        };

        const orderTracking = await checkoutModel.createOrderTransaction(orderData);

        return orderTracking;
    }
};

module.exports = checkoutServices;