const shipmentServices = require('../services/shipmentServices');

const shipmentController = {
    getMethods: async (req, res) => {
        try {
            const methods = await shipmentServices.getMethods();
            res.status(200).json({ success: true, data: methods });
        } catch (err) { 
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
}

module.exports = shipmentController;