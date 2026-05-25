const trackingServices = require('../services/trackingServices');

const trackingController = {
    getGuestOrder: async(req, res) => {
        try {
            const { code } = req.body;

            if(!code) {
                throw { status: 404, message: "Vui lòng nhập mã đơn hàng" }
            }

            const order = await trackingServices.getGuestInfo(code);

            return res.status(200).json({
                success: true,
                data: order
            });

        } catch (err) { 
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
};

module.exports = trackingController;