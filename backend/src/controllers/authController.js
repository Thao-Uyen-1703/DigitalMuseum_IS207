const authModel = require('../models/authModel');
const tokenHelper = require("../utils/tokenHelper");
const registerValidator = require('../validators/registerValidator');
const authServices = require('../services/authServices');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ email và mật khẩu" });
            }

            const user = await authModel.findUserByEmail(email);

            if (!user) {
                return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
            }

            const isMatch = await authModel.checkPassword(password, user.PasswordHash);

            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
            }

            if(!user.IsActive) {
                return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa" });
            }

            const accessToken = tokenHelper.generateAccessToken(user);
            const refreshToken = tokenHelper.generateRefreshToken(user);

            await authModel.saveRefreshToken(user.UserID, refreshToken);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                accessToken: accessToken,
                user: {
                    id: user.UserID,
                    name: user.FullName,
                    avatar: user.AvatarURL,
                    role: user.Role
                }
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống máy chủ" });
        }
    },

    register: async (req, res) => {
        try {
            if (!req.body) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
            }

            const { error, value } = registerValidator.validate(req.body, { abortEarly: false });

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

            await authServices.registerUser(value);

            return res.status(201).json({
                success: true,
                message: "Đăng ký tài khoản thành công!"
            });

        } catch (err) {
            console.log(err);
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    me: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const user = await authModel.findUserById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
            }

            const userInfo = {
                id: user.UserID,
                username: user.FullName,
                email: user.Email,
                role: user.Role,
                isActive: user.IsActive
            };

            return res.status(200).json({
                success: true,
                data: userInfo
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống máy chủ" });
        }
    }
};

module.exports = authController;