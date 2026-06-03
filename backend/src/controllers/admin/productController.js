const productServices = require('../../services/admin/productServices');
const productValidator = require('../../validators/productValidator');

const productController = {
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const search = req.query.search || '';
            const category = req.query.category || '';
            const status = req.query.status || '';
            const stock = req.query.stock || '';
            const location = req.query.location || '';
            
            let sortConfigs = [];
            const sortQuery = req.query.sortConfigs || req.query.sortConfig;
            
            if (sortQuery) {
                try {
                    sortConfigs = JSON.parse(sortQuery);
                } catch (e) {
                    sortConfigs = [];
                }
            }

            const filters = { page, perPage, search, category, status, stock, location, sortConfigs };
            const data = await productServices.getProductsFilter(filters);

            return res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) throw { status: 400, message: 'ID sản phẩm không hợp lệ' };

            const product = await productServices.getProductById(id);

            return res.status(200).json({
                success: true,
                data: product
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },

    create: async (req, res) => {
        try {
            const productData = {
                ...req.body,
                LocationIDs: req.body.LocationIDs ? JSON.parse(req.body.LocationIDs) : []
            };

            if (req.file) {
                productData.image = req.file;
            }

            const { error, value } = productValidator.validate(productData, { abortEarly: false });

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

            const payload = { ...value };

            if (value.image) {
                payload.ImageURL = value.image.filename;
            }
            delete payload.image;

            const result = await productServices.createProduct(payload);

            return res.status(201).json({
                success: true,
                message: 'Tạo sản phẩm thành công',
                data: result
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;

            const productData = {
                ...req.body,
                LocationIDs: req.body.LocationIDs ? JSON.parse(req.body.LocationIDs) : []
            };

            if (req.file) {
                productData.image = req.file;
            }

            const { error, value } = productValidator.validate(productData, { abortEarly: false });

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

            const payload = { ...value };

            if (value.image) {
                payload.ImageURL = value.image.filename;
            }
            delete payload.image;

            await productServices.updateProduct(id, payload);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thành công'
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) throw { status: 400, message: 'ID sản phẩm không hợp lệ' };

            await productServices.deleteProduct(id);

            return res.status(200).json({
                success: true,
                message: 'Xóa sản phẩm thành công'
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    },
    
    toggleStatus: async(req, res) => {
        try {
            const { id } = req.params;
            if (!id) throw { status: 400, message: 'ID sản phẩm không hợp lệ' };

            await productServices.toggleStatus(id);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái thành công'
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || 'Lỗi hệ thống máy chủ';
            return res.status(statusCode).json({ success: false, message });
        }
    }
};

module.exports = productController;