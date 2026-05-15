const productModel = require('../models/productModel');

const productServices = {
    getProductsByFilters: async (filters) => {
        try {
            const { page, perPage } = filters;

            const offset = (page - 1) * perPage;

            const [products, totalItems] = await Promise.all([
                productModel.getFiltered({ ...filters, offset }),
                productModel.countFiltered(filters)
            ]);

            const totalPages = Math.ceil(totalItems / perPage) || 1;

            return {
                products,
                totalItems,
                totalPages
            };
        } catch (error) {
            console.error('Product Service Error:', error);
            throw error;
        }
    }
}

module.exports = productServices;