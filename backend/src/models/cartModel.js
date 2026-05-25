const db = require('../config/mysql');

const cartModel = {
    getCart: async (id) => {
        const query = `
            SELECT p.ProductID, p.ProductName, ci.Quantity, p.Price, p.ImageURL
            FROM cart c
            INNER JOIN cartitems ci ON c.CartID = ci.CartID
            INNER JOIN products p ON ci.ProductID = p.ProductID
            WHERE c.UserID = ?
        `;
        const [rows] = await db.query(query, [id]); 
        return rows;
    },

    getActiveCartId: async (userId) => {
        const [rows] = await db.query('SELECT CartID FROM cart WHERE UserID = ? LIMIT 1', [userId]);
        return rows.length > 0 ? rows[0].CartID : null;
    },

    createCart: async (userId) => {
        const [result] = await db.query('INSERT INTO cart (UserID) VALUES (?)', [userId]);
        return result.insertId;
    },

    // Bỏ CartItemID đi, chỉ cần lấy Quantity
    getItemInCart: async (cartId, productId) => {
        const [rows] = await db.query('SELECT Quantity FROM cartitems WHERE CartID = ? AND ProductID = ?', [cartId, productId]);
        return rows.length > 0 ? rows[0] : null;
    },

    addItem: async (cartId, productId, quantity) => {
        await db.query('INSERT INTO cartitems (CartID, ProductID, Quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
    },

    // Sửa điều kiện WHERE thành CartID và ProductID
    updateQuantity: async (cartId, productId, newQuantity) => {
        await db.query('UPDATE cartitems SET Quantity = ? WHERE CartID = ? AND ProductID = ?', [newQuantity, cartId, productId]);
    },

    // Sửa điều kiện WHERE thành CartID và ProductID
    removeCartItem: async (cartId, productId) => {
        await db.query('DELETE FROM cartitems WHERE CartID = ? AND ProductID = ?', [cartId, productId]);
    }
};

module.exports = cartModel;