const profileServices = require('../services/profileServices');
const profileValidator = require('../validators/profileValidator');

const profileController = {
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const results = await profileServices.getProfile(userId);

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (err) {
            console.log(err);
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;

            const data = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                image: req.file
            };

            const { error, value } = profileValidator.validate(data, { abortEarly: false });

            if (error) {
                const errorDetails = {};
                error.details.forEach(detail => {
                    errorDetails[detail.path[0]] = detail.message;
                });
                
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: errorDetails 
                });
            }

            // Chỉ gắn avatarUrl nếu người dùng thực sự có tải file ảnh mới lên
            const updateData = {
                fullName: value.fullName,
                phone: value.phone
            };
            if (value.image) {
                updateData.avatarUrl = value.image.filename; 
            }

            // GỌI SERVICE ĐỂ XỬ LÝ LƯU VÀO DATABASE (Lỗi cũ của bạn là thiếu phần này)
            const updatedUser = await profileServices.updateUserProfile(userId, updateData);

            return res.status(200).json({
                success: true,
                message: "Cập nhật thông tin tài khoản thành công!",
                data: updatedUser
            });

        } catch (err) {
            console.error(err);
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
};

module.exports = profileController;
