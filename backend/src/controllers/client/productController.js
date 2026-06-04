const productServices = require('../../services/client/productServices')

const productController = {
    getAllProductByFilters: async (req, res) => {
        try {
            const { location, price_from, price_to, order, page, per_page, search } = req.query;

            const filterParams = {
                location: location || null,
                priceFrom: price_from ? parseFloat(price_from) : null,
                priceTo: price_to ? parseFloat(price_to) : null,
                sortBy: order || 'newest',
                search: search || '',
                page: parseInt(page) || 1,
                perPage: parseInt(per_page) || 10
            };

            const result = await productServices.getProductsByFilters(filterParams);

            res.status(200).json({ 
                success: true, 
                data: result.products,
                current_page: filterParams.page,
                per_page: filterParams.perPage,
                last_page: result.totalPages,
                total: result.totalItems
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    getProductDetails: async (req, res) => {
        try {
            const slug = req.params.name;

            if (!slug) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            const results = await productServices.getProductDetails(slug);

            res.status(200).json({ success: true, data: results });
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
                return res.status(400).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    getLandingProducts: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit, 10) || 5;
            const products = await productServices.getLandingProducts({ limit });

            res.status(200).json({ success: true, data: products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    searchSuggestions: async (req, res) => {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }

            const filterParams = {
                location: null,
                priceFrom: null,
                priceTo: null,
                sortBy: 'newest',
                search: q.trim(),
                page: 1,
                perPage: 5
            };

            const result = await productServices.getProductsByFilters(filterParams);

            res.status(200).json({ 
                success: true, 
                data: result.products.map(p => ({
                    ProductID: p.ProductID,
                    ProductName: p.ProductName,
                    SlugName: p.SlugName,
                    Price: p.Price,
                    ImageURL: p.ImageURL,
                    Stock: p.Stock
                }))
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },
};

module.exports = productController;