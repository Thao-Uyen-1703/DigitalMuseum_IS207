const cartServices = require('../services/cartServices');

const cartController = {
    getUserCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const cart = await cartServices.getUserCart(userId);

            return res.status(200).json({ success: true, data: cart });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    addItemToCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
            }

            await cartServices.addItemToCart(userId, productId, quantity);

            return res.status(201).json({ success: true, message: "Đã thêm sản phẩm vào giỏ hàng" });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    mergeCart: async(req, res) => {
        try {
            const userId = req.user.id;
            const { items } = req.body;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Dữ liệu không hợp lệ" 
                });
            }

            await cartServices.mergeCart(userId, items);

            return res.status(200).json({ 
                success: true, 
                message: "Đồng bộ giỏ hàng thành công" 
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    updateCartItemQuantity: async (req, res) => {
        try {
            const userId = req.user.id;
            const productId = req.params.id;
            const { quantity } = req.body;

            if(!productId || !quantity || quantity <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Dữ liệu không hợp lệ" 
                }); 
            }

            await cartServices.updateCartItemQuantity(userId, productId, quantity);

            return res.status(200).json({ 
                success: true, 
                message: "Cập nhật thành công" 
            });

        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    removeCartItem: async (req, res) => {
        try {
            const userId = req.user.id;
            const productId = req.params.id;

            if(!productId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Dữ liệu không hợp lệ" 
                }); 
            }

            await cartServices.removeCartItem(userId, productId);

            return res.status(200).json({ 
                success: true, 
                message: "Xoá sản phẩm thành công" 
            });

        } catch (err) {
            console.log(err);
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
}

module.exports = cartController;