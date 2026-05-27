const shipmentModel = require('../../models/shipmentModel');

const shipmentServices = {
    getMethods: async() => {
        try {
            const methods = await shipmentModel.getMethods();
            return methods;
        } catch (err) {
            throw { status: 500, message: err };
        }
    }
}

module.exports = shipmentServices;