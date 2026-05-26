const checkoutServices = require('../../services/client/checkoutServices');
const checkoutValidator = require('../../validators/checkoutValidator');

const checkoutController = {
    createOrder: async(req, res) => {
        try {
            if(!req.body) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
            }

            const userId = req.user?.id || null;

            const { error, value } = checkoutValidator.validate(req.body, { abortEarly: false });

            if(error || !value) {
                const errorDetails = error ? {} : { body: "Dữ liệu không hợp lệ" };
                if(error) {
                    error.details.forEach(detail => {
                        errorDetails[detail.path[0]] = detail.message;
                    });
                }
                
                return res.status(400).json({
                    success: false,
                    errors: errorDetails 
                });
            }

            const results = await checkoutServices.createOrder(value, userId);

            return res.status(201).json({
                success: true,
                data: results
            });

        } catch (err) { 
            console.log(err);
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
}

module.exports = checkoutController;