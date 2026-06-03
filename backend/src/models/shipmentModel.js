const db = require('../config/mysql');

const shipmentModel = {
    getMethods: async () => {
        const [rows] = await db.query('SELECT * FROM shippingmethods');
        return rows;
    },

    getShipmentByID: async(id) => {
        const [rows] = await db.query('SELECT * FROM shipments WHERE ShipmentID = ?', [id]);
        return rows[0];
    },

    createShipment: async(shipment) => {
        const query = `
            INSERT INTO shipments SET ?
        `;
        const [rows] = await db.query(query, [shipment]);
        return rows.insertId;
    },

    updateShipment: async(id, shipment) => {
        console.log(shipment);
        const query = `
            UPDATE shipments
            SET ?
            WHERE ShipmentID = ?
        `;
        const [rows] = await db.query(query, [shipment, id]);
        return rows.affectedRows;
    }
}

module.exports = shipmentModel;