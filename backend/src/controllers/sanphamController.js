const productModel = require('../models/sanphamModel');

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await productModel.getAll();
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    findProductById: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productModel.getProductById(id);

            if(!product) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },
};

module.exports = productController;