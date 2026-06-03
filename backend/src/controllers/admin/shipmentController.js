const shipmentServices = require('../../services/admin/shipmentServices');

const shipmentController = {
    create: async(req, res) => {
        try {
            const data = req.body;

            if(!data.OrderID || !data.Status) {
                throw { status: 400, message: "Vui lòng điền đủ thông tin" }
            }

            await shipmentServices.createShipment(data);

            return res.status(201).json({
                success: true,
                message: "Tạo vận chuyển thành công"
            })
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },

    update: async(req, res) => {
        try {
            const data = req.body;
            const { id } = req.params;

            if(!data.OrderID || !data.Status || !id) {
                throw { status: 400, message: "Vui lòng điền đủ thông tin" }
            }

            await shipmentServices.updateShipment(id, data);

            return res.status(200).json({
                success: true,
                message: "Cập nhật vận chuyển thành công"
            })
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    }
};

module.exports = shipmentController;