const categoryModel = require('../../models/categoryModel');

const categoryServices = {
    getAllCategory: async() => {
        // Backwards-compatible: return all categories with counts attached
        const categories = await categoryModel.getAllCategory();
        const counts = await categoryModel.getProductCounts();

        const countMap = {};
        counts.forEach(row => {
            countMap[row.CategoryID] = Number(row.ProductCount) || 0;
        });

        const enriched = categories.map(c => ({
            ...c,
            ProductCount: countMap[c.CategoryID] || 0
        }));

        return enriched;
    },

    getCategoriesFilter: async (filters) => {
        const page = parseInt(filters.page) || 1;
        const perPage = parseInt(filters.perPage) || 10;
        const offset = (page - 1) * perPage;

        const [results, totalItems] = await Promise.all([
            categoryModel.getAdvanceFiltered({ ...filters, perPage, offset }),
            categoryModel.countAdvanceFiltered(filters)
        ]);

        const totalPages = Math.ceil(totalItems / perPage) || 1;

        return {
            categories: results,
            totalItems,
            totalPages
        };
    },

    createCategory: async(data) => {
        const existCategory = await categoryModel.getCategoryByName(data.CategoryName);

        if(existCategory) {
           throw { status: 400, message: "Tên danh mục đã tồn tại" } 
        }

        const results = await categoryModel.createCategory(data);

        return results;
    },

    updateCategory: async(id, data) => {
        const existCategory = await categoryModel.getCategoryByID(id);

        if(!existCategory) {
           throw { status: 400, message: "Danh mục không tồn tại" } 
        }

        const results = await categoryModel.updateCategory(id, data);

        return results;
    },

    deleteCategory: async(id) => {
        const existCategory = await categoryModel.getCategoryByID(id);

        if(!existCategory) {
           throw { status: 400, message: "Danh mục không tồn tại" } 
        }

        const existProductInCategory = await categoryModel.existProductInCategory(id);

        if(existProductInCategory) {
           throw { status: 400, message: "Tồn tại sản phẩm trong danh mục, cần kiểm tra trước khi xóa" } 
        }

        const results = await categoryModel.deleteCategory(id);

        return results;
    }
};

module.exports = categoryServices;