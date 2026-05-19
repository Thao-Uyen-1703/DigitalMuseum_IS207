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
    },

    getProductDetails: async(slug) => {
        try {
            const product = await productModel.getProductBySlug(slug);

            if(!product) {
                throw { status: 404, message: 'Sản phẩm không tồn tại' };
            }

            const reviews = await productModel.getReviewList(product.ProductID);
            const category = await productModel.getCategoryInfo(product.CategoryID);
            const location = await productModel.getLocationInfo(product.OriginLocationID);

            if(product.Details && typeof product.Details === 'string') {
                product.Details = JSON.parse(product.Details);
            }

            if(location.Details && typeof location.Details === 'string') {
                location.Details = JSON.parse(location.Details);
            }

            const results = {
                product: product,
                reviews: reviews,
                category: category,
                location: location
            };

            return results;
        } catch (error) {
            console.error('Product Services Error: ', error);
            throw error;
        }
    }
}

module.exports = productServices;