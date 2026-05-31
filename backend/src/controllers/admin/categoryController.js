const categoryServices = require('../../services/admin/categoryServices');
const categoryValidator = require('../../validators/categoryValidator');

const categoryController = {
    getAllCategory: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const search = req.query.search || '';

            let sortConfigs = [];
            const sortQuery = req.query.sortConfigs || req.query.sortConfig;
            if (sortQuery) {
                try {
                    sortConfigs = JSON.parse(sortQuery);
                } catch (e) {
                    sortConfigs = [];
                }
            }

            const filters = { page, perPage, search, sortConfigs };

            const data = await categoryServices.getCategoriesFilter(filters);

            return res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || "Lỗi hệ thống";
            return res.status(status).json({
                success: false,
                message: message
            })
        }
    },

    create: async (req, res) => {
        try {
            if(!req.body.CategoryName) {
                throw { status: 400, message: "Vui lòng điền đủ thông tin" }
            }

            const { error, value } = categoryValidator.validate(req.body, { abortEarly: false });

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

            await categoryServices.createCategory(value);

            return res.status(201).json({
                success: true,
                message: "Tạo danh mục thành công"
            })
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || "Lỗi hệ thống";
            return res.status(status).json({
                success: false,
                message: message
            })
        }
    },

    update: async(req, res) => {
        try {
            const { id } = req.params;

            if(!id) {
                throw { status: 400, message: "Vui lòng điền đủ thông tin" }
            }

            if(!req.body.CategoryName) {
                throw { status: 400, message: "Vui lòng điền đủ thông tin" }
            }

            const { error, value } = categoryValidator.validate(req.body, { abortEarly: false });

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

            await categoryServices.updateCategory(id, value);

            return res.status(201).json({
                success: true,
                message: "Cập nhật danh mục thành công"
            })
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || "Lỗi hệ thống";
            return res.status(status).json({
                success: false,
                message: message
            })
        }   
    },

    delete: async(req, res) => {
        try {
            const { id } = req.params;

            if(!id) {
                throw { status: 400, message: "Vui lòng điền đủ thông tin" }
            }

            await categoryServices.deleteCategory(id);

            return res.status(201).json({
                success: true,
                message: "Xóa danh mục thành công"
            })
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || "Lỗi hệ thống";
            return res.status(status).json({
                success: false,
                message: message
            })
        }   
    }
};

module.exports = categoryController;