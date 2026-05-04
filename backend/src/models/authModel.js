const db = require('../config/mysql');
const bcrypt = require('bcrypt');

const authModel = {
    findUserByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
        return rows[0];
    },

    checkPassword: async (password, hash) => {
        if (!password || !hash) {
            return false;
        }

        return await bcrypt.compare(password, hash);
    },
};

module.exports = authModel;