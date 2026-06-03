const db = require('../config/mysql');

const userModel = {
    getUsers: async() => {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    },

    getUsersFilter: async ({ perPage, offset, search, role, sortConfigs }) => {
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push('(FullName LIKE ? OR Email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            conditions.push('Role = ?');
            params.push(role);
        }

        let orderClause = '';
        if (Array.isArray(sortConfigs) && sortConfigs.length > 0) {
            const allowedFields = ['FullName', 'Role', 'Email', 'CreatedAt'];
            const orders = sortConfigs
                .filter((item) => allowedFields.includes(item.key))
                .map((item) => `${item.key} ${item.direction === 'desc' ? 'DESC' : 'ASC'}`);

            if (orders.length > 0) {
                orderClause = ` ORDER BY ${orders.join(', ')}`;
            }
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT * FROM users ${whereClause}${orderClause} LIMIT ? OFFSET ?`;
        const [rows] = await db.query(sql, [...params, perPage, offset]);
        return rows;
    },

    countUsersFilter: async ({ search, role }) => {
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push('(FullName LIKE ? OR Email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            conditions.push('Role = ?');
            params.push(role);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await db.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
        return rows[0].total || 0;
    },

    findUserByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
        return rows[0];
    },

    findUserById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE UserID = ?', [id]);
        return rows[0];
    },

    createUser: async ({ FullName, Email, Role, PasswordHash, IsActive }) => {
        const sql = 'INSERT INTO users (FullName, Email, Role, PasswordHash, IsActive) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [FullName, Email, Role, PasswordHash, IsActive ? 1 : 0]);
        return result;
    },

    updateUser: async (id, data) => {
        const fields = [];
        const values = [];

        if (data.FullName !== undefined) {
            fields.push('FullName = ?');
            values.push(data.FullName);
        }
        if (data.Email !== undefined) {
            fields.push('Email = ?');
            values.push(data.Email);
        }
        if (data.Role !== undefined) {
            fields.push('Role = ?');
            values.push(data.Role);
        }
        if (data.IsActive !== undefined) {
            fields.push('IsActive = ?');
            values.push(data.IsActive ? 1 : 0);
        }

        if (fields.length === 0) {
            return null;
        }

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE UserID = ?`;
        values.push(id);
        const [result] = await db.query(sql, values);
        return result;
    },

    getUsersCount: async() => {
        const [rows] = await db.query('SELECT Count(*) as total FROM users');
        return rows[0].total || 0;
    },

    getUsersCountByMonth: async(month, year) => {
        const query = `
            SELECT Count(*) as total
            FROM users
            WHERE YEAR(CreatedAt) = ?
            AND MONTH(CreatedAt) = ?
        `;

        const [rows] = await db.execute(query, [year, month]);
        return rows[0].total || 0;
    },
 
    getUsersCountByDateRange: async(startDate, endDate) => {
        const query = `
            SELECT Count(*) as total
            FROM users
            WHERE CreatedAt BETWEEN ? AND ?
        `;

        const [rows] = await db.execute(query, [startDate, endDate]);
        return rows[0].total || 0;
    }
};

module.exports = userModel;
