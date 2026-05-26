const { changePassword } = require('../controllers/authController');
const authModel = require('../models/authModel');
const tokenHelper = require("../utils/tokenHelper");
const bcrypt = require('bcrypt');

const authServices = {
    authenticateUser: async(email, password) => {
        const user = await authModel.findUserByEmail(email);

        if (!user) {
            throw { status: 400, message: "Email hoặc mật khẩu không đúng" };
        }

        const isMatch = await authServices.checkPassword(password, user.PasswordHash);

        if (!isMatch) {
            throw { status: 400, message: "Email hoặc mật khẩu không đúng" };
        }

        if(!user.IsActive) {
            throw { status: 400, message: "Tài khoản đã bị khóa" };
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
            phone: user.Phone,
            avatar: user.AvatarURL
        };

        return userInfo;
    },

    refreshToken: async (refreshToken) => {
        if (!refreshToken) {
            throw { status: 401, message: "Có lỗi xảy ra, vui lòng đăng nhập lại" };
        }

        const decoded = tokenHelper.verifyRefreshToken(refreshToken);
        if (!decoded) {
            throw { status: 401, message: "Có lỗi xảy ra, vui lòng đăng nhập lại" };
        }

        const user = await authModel.findUserById(decoded.id);
        if (!user) {
            throw { status: 401, message: "Người dùng không tồn tại" };
        }

        if (!user.IsActive) {
            throw { status: 401, message: "Tài khoản đã bị khóa" };
        }

        if (user.refresh_token !== refreshToken) {
            throw { status: 401, message: "Có lỗi xảy ra, vui lòng đăng nhập lại" };
        }

        const newAccessToken = tokenHelper.generateAccessToken(user);
        const newRefreshToken = tokenHelper.generateRefreshToken(user);

        await authModel.saveRefreshToken(user.UserID, newRefreshToken);

        return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
    },

    logout: async (refreshToken) => {
        if (!refreshToken) {
            return true;
        }

        const decoded = tokenHelper.verifyRefreshToken(refreshToken);
        if (!decoded) {
            return true;
        }

        const user = await authModel.findUserById(decoded.id);
        if (!user) {
            return true;
        }

        await authModel.clearToken(user.UserID);
        return true;
    },

    changePassword: async(userId, oldPassword, newPassword, rePassword) => {
        const user = await authModel.findUserById(userId);


        const isMatch = await authServices.checkPassword(oldPassword, user.PasswordHash);

        if (!isMatch) {
            throw { status: 400, message: "Mật khẩu cũ không đúng" };
        }

        if(newPassword != rePassword) {
            throw { status: 400, message: "Mật khẩu nhập lại không khớp" }
        }

        const hashPass = await authServices.hashPassword(newPassword);

        const result = await authModel.changePassword(user.UserID, hashPass);

        return result;
    }
};

module.exports = authServices;