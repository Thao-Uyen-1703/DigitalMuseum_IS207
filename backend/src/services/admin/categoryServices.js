const categoryModel = require('../../models/categoryModel');

const categoryServices = {
    getAllCategory: async() => {
        const results = await categoryModel.getAllCategory();

        return results;
    }
};

module.exports = categoryServices;