const authModel = require('../models/authModel');
const generateToken = require("../utils/generateToken");

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

            const token = generateToken(user);

            const userInfo = {
                id: user.UserID,
                username: user.FullName,
                email: user.Email,
                role: user.Role
            };

            return res.status(200).json({
                success: true,
                token,
                data: userInfo
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống máy chủ" });
        }
    },

    getHashPass: async (req, res) => {
        const { password } = req.body;

        const hash = await authModel.hashPassword(password);

        return res.status(200).json({
            success: true,
            data: hash
        });
    }
};

module.exports = authController;