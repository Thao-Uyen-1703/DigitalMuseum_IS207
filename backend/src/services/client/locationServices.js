const locationModel = require('../../models/locationModel');

const locationServices = {
    getAllLocations: async () => {
        return await locationModel.getAll();
    },

    getLocationById: async (id) => {
        const location = await locationModel.getLocationById(id);

        if (!location) {
            throw new Error('LOCATION_NOT_FOUND');
        }

        return location;
    }
};

module.exports = locationServices;