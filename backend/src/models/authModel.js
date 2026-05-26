const db = require('../config/mysql');

const authModel = {
    findUserByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
        return rows[0];
    },

    findUserById: async (userId) => {
        const [rows] = await db.query('SELECT * FROM users WHERE UserID = ?', [userId]);
        return rows[0];
    },

    saveRefreshToken: async (userId, token) => {
        const [results] = await db.query('UPDATE users SET refresh_token = ? WHERE UserID = ?', [token, userId]);

        return results.affectedRows > 0;
    },

    clearToken: async (userId) => {
        const [results] = await db.query('UPDATE users SET refresh_token = NULL WHERE UserID = ?', [userId]);
        return results.affectedRows > 0;
    },

    createUser: async ({name, email, phone, password}) => {
        const sql = 'INSERT INTO users(FullName, Email, PasswordHash, Phone) VALUES (?, ?, ?, ?)';
        const [results] = await db.query(sql, [name, email, password, phone]);
        return results.affectedRows > 0;
    },

    changePassword: async(id, password) => {
        const sql = 'UPDATE users SET PasswordHash = ? WHERE UserID = ?';
        const [results] = await db.query(sql, [password, id]);
        return results.affectedRows > 0;
    }
};

module.exports = authModel;