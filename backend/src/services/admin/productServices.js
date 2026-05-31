const productModel = require('../../models/productModel');
const slugtify = require('../../utils/slugtify');

const productServices = {
    getProductsFilter: async (filters) => {
        const { page, perPage } = filters;
        const offset = (page - 1) * perPage;

        const [results, totalItems] = await Promise.all([
            productModel.getAdvanceFiltered({ ...filters, offset }),
            productModel.countAdvanceFiltered(filters)
        ]);

        const totalPages = Math.ceil(totalItems / perPage) || 1;

        const products = results.map(product => ({
            ...product,
            LocationIDs: product.LocationIDs
                ? product.LocationIDs.split(',').map(Number)
                : []
        }));

        return {
            products,
            totalItems,
            totalPages
        };
    },

    getProductById: async (id) => {
        const product = await productModel.getProductById(id);
        if (!product) {
            throw { status: 404, message: 'Sản phẩm không tồn tại' };
        }
        return product;
    },

    getProductDetails: async(slug) => {
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
    },

    createProduct: async(productData) => {
        const existProduct = await productModel.getProductByName(productData.ProductName);

        if(existProduct) {
           throw { status: 400, message: "Tên sản phẩm đã tồn tại" } 
        }

        const slug = await productServices.generateSlugName(productData.ProductName);

        const payload = {
            ProductName: productData.ProductName,
            CategoryID: productData.CategoryID || null,
            OriginLocationID: productData.OriginLocationID || [],
            SlugName: slug,
            CulturalStory: productData.CulturalStory || null,
            LocationIDs: productData.LocationIDs || [],
            Price: productData.Price || 0,
            Weight: productData.Weight || 0,
            Stock: productData.Stock || 0,
            ImageURL: productData.ImageURL || null,
            IsActive: 0
        }

        const results = await productModel.createProduct(payload);

        return results;
    },

    updateProduct: async (id, updateData) => {
        const product = await productModel.getProductById(id);
        if (!product) throw { status: 404, message: 'Sản phẩm không tồn tại' };

        if(updateData.ProductName && updateData.ProductName != product.ProductName) {
            updateData.SlugName = await productServices.generateSlugName(updateData.ProductName);
        }

        const newLocationIDs = updateData.LocationIDs;
        delete updateData.LocationIDs;

        if (Object.keys(updateData).length > 0) {
            await productModel.updateProduct(id, updateData);
        }

        await productModel.updateProduct(id, updateData);

        if (newLocationIDs) {
            const existLocations = await productModel.getProductLocations(product.ProductID);
            const isSameLocations = productServices.isSameArray(existLocations, newLocationIDs);

            if (!isSameLocations) {
                await productModel.updateProductLocations(id, newLocationIDs);
            }
        }
    },

    deleteProduct: async (id) => {
        const product = await productModel.getProductById(id);
        if (!product) throw { status: 404, message: 'Sản phẩm không tồn tại' };
        
        await productModel.deleteProduct(id);
        return true;
    },

    generateSlugName: async (name) => {
        const baseSlug = slugtify(name);

        let slug = baseSlug;
        let counter = 1;

        while (await productModel.existSlugName(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }

        return slug;
    },

    isSameArray: (a, b) => {
        if (a.length !== b.length) return false;

        const setA = new Set(a);
        const setB = new Set(b);

        for (const item of setA) {
            if (!setB.has(item)) return false;
        }

        return true;
    },

    toggleStatus: async (id) => {
        const product = await productModel.getProductById(id);
        if (!product) throw { status: 404, message: 'Sản phẩm không tồn tại' };

        const newStatus = product.IsActive === 1 ? 0 : 1;
        
        await productModel.updateProduct(id, { IsActive: newStatus });
        
        return { ...product, IsActive: newStatus };
    }
}

module.exports = productServices;