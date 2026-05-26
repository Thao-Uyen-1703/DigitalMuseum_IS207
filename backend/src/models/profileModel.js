const db = require('../config/mysql');

const profileModel = {
    getUserProfile: async(id) => {
        const [rows] = await db.query('SELECT FullName, Email, Phone, AvatarURL FROM users WHERE UserID = ?', [id]);
        return rows[0];
    },

    updateUserProfile: async (userId, {fullname, phone, avatar}) => {
        const fields = [];
        const values = [];
        
        if (fullname !== undefined) {
            fields.push('FullName = ?');
            values.push(fullname);
        }
        if (phone !== undefined) {
            fields.push('Phone = ?');
            values.push(phone);
        }
        if (avatar !== undefined) {
            fields.push('AvatarURL = ?');
            values.push(avatar);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(userId);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE UserID = ?`;
        const [results] = await db.query(sql, values);
        return results.affectedRows > 0;
    }
}

module.exports = profileModel;