const paymentServices = require('../../services/admin/paymentServices');

const paymentController = {
    create: async(req, res) => {
        try {
            const data = req.body;

            if(!data.OrderID || !data.PaymentMethod) {
                throw { status: 400, message: "Vui lòng nhập đủ thông tin" }
            }

            await paymentServices.createPayment(data);

            return res.status(201).json({
                success: true,
                message: "Tạo thanh toán thành công"
            })
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },

    update: async(req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            if(!data.OrderID || !data.PaymentMethod || !id) {
                throw { status: 400, message: "Vui lòng nhập đủ thông tin" }
            }

            await paymentServices.updatePayment(id, data);

            return res.status(200).json({
                success: true,
                message: "Cập nhật thành công"
            })
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    }
};

module.exports = paymentController;