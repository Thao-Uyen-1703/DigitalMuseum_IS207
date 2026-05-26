const orderServices = require('../../services/client/orderServices');

const orderController = {
    getOrderList: async(req, res) => {
        try {
            const id = req.user.id;

            const orders = await orderServices.getUserOrders(id);

            return res.status(200).json({
                success: true,
                data: orders
            });
        } catch (err) { 
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const user = req.user.id;
            const trackNum = req.params.id;

            if(!trackNum) {
                throw { status: 404, message: "Đơn hàng không hợp lệ" }
            }     
            
            const results = await orderServices.getOrderDetails(trackNum, user);

            return res.status(200).json({
                success: true,
                data: results
            })
        } catch (err) {
            console.log(err);
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
};

module.exports = orderController;