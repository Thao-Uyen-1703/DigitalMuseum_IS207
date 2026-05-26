const profileModel = require('../models/profileModel');

const profileServices = {
    getProfile: async(id) => {
        const user = await profileModel.getUserProfile(id);
        
        if (!user) {
            throw { status: 404, message: "Người dùng không tồn tại" };
        }
        
        return user;
    },

    updateUserProfile: async (userId, data) => {
        const user = await profileModel.getUserProfile(userId);

        if (!user) {
            throw { status: 404, message: "Người dùng không tồn tại" };
        }

        const updateData = {};
        if (data.fullName) updateData.fullname = data.fullName;
        if (data.phone) updateData.phone = data.phone;
        if (data.avatarUrl) updateData.avatar = data.avatarUrl;

        const results = await profileModel.updateUserProfile(userId, updateData);

        if (!results) {
            throw { status: 500, message: "Có lỗi xảy ra khi cập nhật thông tin" };
        }

        const updatedUser = await profileModel.getUserProfile(userId);
        return {
            fullname: updatedUser.FullName,
            email: updatedUser.Email,
            phone: updatedUser.Phone,
            avatar: updatedUser.AvatarURL
        };
    }
}

module.exports = profileServices;