const productModel = require('../../models/productModel');

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

    getProductDetails: async(id, slug) => {
        try {
            const product = await productModel.getProductBySlug(slug);

            if(!product) {
                throw { status: 404, message: 'Sản phẩm không tồn tại' };
            }

            await productModel.countProductView(id, product.ProductID);

            const [reviews, category, location] = await Promise.all([
                productModel.getReviewList(product.ProductID),
                productModel.getCategoryInfo(product.CategoryID),
                productModel.getLocationInfo(product.OriginLocationID)
            ]);

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
    },

    getLandingProducts: async ({ limit = 5 } = {}) => {
        try {
            const landingFilters = {
                location: null,
                priceFrom: null,
                priceTo: null,
                sortBy: 'newest',
                search: '',
                page: 1,
                perPage: limit,
                offset: 0
            };

            const products = await productModel.getFiltered(landingFilters);
            return products;
        } catch (error) {
            console.error('Product Services Error (landing products): ', error);
            throw error;
        }
    }
}

module.exports = productServices;