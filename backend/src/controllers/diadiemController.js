const diadiemModel = require('../models/diadiemModel');

const diadiemController = {
    getAllLocations: async (req, res) => {
        try {
            const locations = await diadiemModel.getAll();
            res.status(200).json({ success: true, data: locations });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    findLocationByID: async (req, res) => {
        try {
            const id = req.params.id;
            const diadiem = await diadiemModel.getLocationById(id);

            if(!diadiem) {
                return res.status(400).json({ success: false, message: 'Không tìm thấy địa điểm' });
            }

            res.status(200).json({ success: true, data: diadiem });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },
};

module.exports = diadiemController;