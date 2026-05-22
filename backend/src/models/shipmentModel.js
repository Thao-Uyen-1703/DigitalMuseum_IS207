const db = require('../config/mysql');

const shipmentModel = {
    getMethods: async () => {
        const [rows] = await db.query('SELECT * FROM shippingmethods');
        return rows;
    }
}

module.exports = shipmentModel;