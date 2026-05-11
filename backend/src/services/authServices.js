const authModel = require('../models/authModel');
const tokenHelper = require("../utils/tokenHelper");
const bcrypt = require('bcrypt');

const authServices = {
    authenticateUser: async(email, password) => {
        const user = await authModel.findUserByEmail(email);

        if (!user) {
            throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
        }

        const isMatch = await authServices.checkPassword(password, user.PasswordHash);

        if (!isMatch) {
            throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
        }

        if(!user.IsActive) {
            throw { status: 403, message: "Tài khoản đã bị khóa" };
        }

        const accessToken = tokenHelper.generateAccessToken(user);
        const refreshToken = tokenHelper.generateRefreshToken(user);
        
        const results = await authModel.saveRefreshToken(user.UserID, refreshToken);

        if(!results) {
            throw { status: 500, message: "Có lỗi xảy ra khi tạo tài khoản" };
        }

        return { user, accessToken, refreshToken };
    },

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

    getUserProfile: async (userId) => {
        const user = await authModel.findUserById(userId);

        if (!user) {
            throw { status: 404, message: "Người dùng không tồn tại"}
        }

        const userInfo = {
            id: user.UserID,
            username: user.FullName,
            email: user.Email,
            role: user.Role,
            isActive: user.IsActive
        };

        return userInfo;
    }
};

module.exports = authServices;