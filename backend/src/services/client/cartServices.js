const cartModel = require('../../models/cartModel');
const productModel = require('../../models/productModel');

const cartServices = {
    getUserCart: async (id) => {
        if(!id) {
            return [];
        }
        const cart = await cartModel.getCart(id);

        // Ensure cart items are still available; remove items with no stock
        const cartId = await cartModel.getActiveCartId(id);
        const filtered = [];

        for (const item of cart) {
            const product = await productModel.getProductById(item.ProductID);

            if (!product || product.Stock <= 0) {
                // remove from cart if product no longer available
                if (cartId) {
                    await cartModel.removeCartItem(cartId, item.ProductID);
                }
                continue;
            }

            // adjust quantity if it exceeds stock
            if (item.Quantity > product.Stock) {
                if (cartId) await cartModel.updateQuantity(cartId, item.ProductID, product.Stock);
                item.Quantity = product.Stock;
            }

            // expose max available to client
            item.MaxAvailable = product.Stock;
            filtered.push(item);
        }

        return filtered;
    },

    addItemToCart: async (userId, productId, quantity) => {
        let cartId = await cartModel.getActiveCartId(userId);
        if (!cartId) {
            cartId = await cartModel.createCart(userId);
        }

        // Check product availability
        const product = await productModel.getProductById(productId);
        if (!product) {
            throw { status: 404, message: 'Sản phẩm không tồn tại' };
        }

        if (product.Stock <= 0) {
            throw { status: 400, message: `Sản phẩm "${product.ProductName}" hiện đã hết hàng` };
        }

        const existingItem = await cartModel.getItemInCart(cartId, productId);

        if (existingItem) {
            const newQuantity = existingItem.Quantity + quantity;
            if (newQuantity > product.Stock) {
                throw { status: 400, message: `Bạn đã lấy tối đa sản phẩm` };
            }
            await cartModel.updateQuantity(cartId, productId, newQuantity);
        } else {
            if (quantity > product.Stock) {
                throw { status: 400, message: `Số lượng tối đa còn lại là ${product.Stock}` };
            }
            await cartModel.addItem(cartId, productId, quantity);
        }

        return true; 
    },

    mergeCart: async (userId, localItems) => {
        try {
            let cartId = await cartModel.getActiveCartId(userId);
            if (!cartId) {
                cartId = await cartModel.createCart(userId);
            }

            for (const item of localItems) {
                const { productId, quantity } = item;
                
                if (!productId || !quantity || quantity <= 0) continue;

                // Check product and stock
                const product = await productModel.getProductById(productId);
                if (!product || product.Stock <= 0) continue; // skip unavailable

                const existingItem = await cartModel.getItemInCart(cartId, productId);

                if (existingItem) {
                    const newQuantity = Math.min(existingItem.Quantity + quantity, product.Stock);
                    await cartModel.updateQuantity(cartId, productId, newQuantity);
                } else {
                    const addQuantity = Math.min(quantity, product.Stock);
                    await cartModel.addItem(cartId, productId, addQuantity);
                }
            }
            return true;
        } catch (error) {
            throw { status: 500, message: error }
        }
    },

    updateCartItemQuantity: async (userId, id, quantity) => {
        let cartId = await cartModel.getActiveCartId(userId);

        if(!cartId) {
            throw { status: 404, message: "Không tìm thấy giỏ hàng" }
        }

        const existingItem = await cartModel.getItemInCart(cartId, id);

        if(!existingItem) {
            throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ hàng" }
        }

        // Validate against stock
        const product = await productModel.getProductById(id);
        if (!product) {
            // remove item if product removed
            await cartModel.removeCartItem(cartId, id);
            throw { status: 404, message: "Sản phẩm không tồn tại" };
        }

        if (product.Stock <= 0) {
            // remove item if out of stock
            await cartModel.removeCartItem(cartId, id);
            throw { status: 400, message: `Sản phẩm "${product.ProductName}" hiện đã hết hàng` };
        }

        if (quantity > product.Stock) {
            throw { status: 400, message: `Số lượng tối đa còn lại là ${product.Stock}` };
        }

        // Sửa: truyền cartId và id (chính là productId)
        await cartModel.updateQuantity(cartId, id, quantity);

        return true;
    },

    removeCartItem: async (userId, id) => {
        let cartId = await cartModel.getActiveCartId(userId);

        if(!cartId) {
            throw { status: 404, message: "Không tìm thấy giỏ hàng" }
        }

        const existingItem = await cartModel.getItemInCart(cartId, id);

        if(!existingItem) {
            throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ hàng" }
        }

        // Sửa: truyền cartId và id (chính là productId)
        await cartModel.removeCartItem(cartId, id);

        return true;
    }

    ,
    validateCartForCheckout: async (userId) => {
        // Reuse getUserCart which cleans unavailable items and adjusts quantities
        const items = await cartServices.getUserCart(userId);
        const issues = [];

        if (!items || items.length === 0) {
            issues.push('Giỏ hàng trống hoặc không còn sản phẩm khả dụng');
        }

        return {
            isValid: issues.length === 0,
            items,
            issues
        };
    }
};

module.exports = cartServices;