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
            await cartModel.updateQuantity(existingItem.CartItemID, newQuantity);
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
                    await cartModel.updateQuantity(existingItem.CartItemID, newQuantity);
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

        await cartModel.updateQuantity(existingItem.CartItemID, quantity);

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

        await cartModel.removeCartItem(existingItem.CartItemID);

        return true;
    }
};

module.exports = cartServices;