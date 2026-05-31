const categoryServices = require('../../services/admin/categoryServices');

const categoryController = {
    getAllCategory: async(req, res) => {
        try {
            const results = await categoryServices.getAllCategory();

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || "Lỗi hệ thống";
            return res.status(status).json({
                success: false,
                message: message
            })
        }
    }
};

module.exports = categoryController;