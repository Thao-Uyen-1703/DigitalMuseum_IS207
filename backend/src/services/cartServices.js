const cartModel = require('../models/cartModel');

const cartServices = {
    getUserCart: async (id) => {
        if(!id) {
            return [];
        }
        const cart = await cartModel.getCart(id);
        return cart;
    },

    addItemToCart: async (userId, productId, quantity) => {
        let cartId = await cartModel.getActiveCartId(userId);
        if (!cartId) {
            cartId = await cartModel.createCart(userId);
        }

        const existingItem = await cartModel.getItemInCart(cartId, productId);

        if (existingItem) {
            const newQuantity = existingItem.Quantity + quantity;
            // Sửa: truyền cartId và productId
            await cartModel.updateQuantity(cartId, productId, newQuantity);
        } else {
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

                const existingItem = await cartModel.getItemInCart(cartId, productId);

                if (existingItem) {
                    const newQuantity = existingItem.Quantity + quantity;
                    // Sửa: truyền cartId và productId thay vì CartItemID
                    await cartModel.updateQuantity(cartId, productId, newQuantity);
                } else {
                    await cartModel.addItem(cartId, productId, quantity);
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
};

module.exports = cartServices;