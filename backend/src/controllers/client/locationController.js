const locationServices = require('../../services/client/locationServices');

const locationController = {
    getAllLocations: async (req, res) => {
        try {
            const locations = await locationServices.getAllLocations();

            res.status(200).json({
                success: true,
                data: locations
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ'
            });
        }
    },

    findLocationByID: async (req, res) => {
        try {
            const { id } = req.params;

            const location = await locationServices.getLocationById(id);

            res.status(200).json({
                success: true,
                data: location
            });
        } catch (error) {
            console.error(error);

            if (error.message === 'LOCATION_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy địa điểm'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ'
            });
        }
    }
};

module.exports = locationController;