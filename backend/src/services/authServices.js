const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');

const authServices = {
    checkPassword: async (password, hash) => {
        if (!password || !hash) {
            return false;
        }

        return await bcrypt.compare(password, hash);
    },

    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    },

    registerUser: async ({ fullname, email, password, phone }) => {
        const existingUser = await authModel.findUserByEmail(email);
        if (existingUser) {
            throw { status: 409, message: "Email này đã được sử dụng" };
        }

        const hashedPassword = await authServices.hashPassword(password);

        const results = await authModel.createUser({
            name: fullname,
            email,
            password: hashedPassword,
            phone
        });

        if(!results) {
            throw { status: 500, message: "Có lỗi xảy ra khi tạo tài khoản" };
        }

        return true;
    },
};

module.exports = authServices;