const registerValidator = require('../validators/registerValidator');
const authServices = require('../services/authServices');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ email và mật khẩu" });
            }

            const { user, accessToken, refreshToken } = await authServices.authenticateUser(email, password);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'prod',
                sameSite: 'Lax',
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
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
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
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    me: async (req, res) => {
        try {
            const userId = req.user.id;

            const userInfo = await authServices.getUserProfile(userId);

            return res.status(200).json({
                success: true,
                data: userInfo
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    refresh: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            const { user, accessToken, refreshToken: newRefreshToken } = await authServices.refreshToken(refreshToken);

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'prod',
                sameSite: 'Lax',
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
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    logout: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            await authServices.logout(refreshToken);

            res.cookie('refreshToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                expires: new Date(0)
            });

            res.status(200).json({
                success: true,
                message: "Đăng xuất thành công"
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword, rePassword } = req.body;

            if(!oldPassword || !newPassword || !rePassword) {
                throw { status: 400, message: "Vui lòng điền đủ các thông tin" }
            }

            const results = await authServices.changePassword(userId, oldPassword, newPassword, rePassword);

            return res.status(200).json({
                success: true,
            });
            
        } catch (err) {
            console.log(err);
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
}

module.exports = authController;