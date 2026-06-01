const locationServices = require('../../services/admin/locationServices');
const locationValidator = require('../../validators/locationValidator');

const locationController = {
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const search = req.query.search || '';

      let sortConfigs = [];
      const sortQuery = req.query.sortConfigs || req.query.sortConfig;
      if (sortQuery) {
        try {
          sortConfigs = JSON.parse(sortQuery);
        } catch (e) {
          sortConfigs = [];
        }
      }

      const filters = { page, perPage, search, sortConfigs };
      const data = await locationServices.getLocationsFilter(filters);

      return res.status(200).json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({ success: false, message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const location = await locationServices.getLocationById(id);
      return res.status(200).json({ success: true, data: location });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({ success: false, message });
    }
  },

  create: async (req, res) => {
    try {
      const locationData = { ...req.body };
      if (req.file) {
        locationData.image = req.file;
      }

      const { error, value } = locationValidator.validate(locationData, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          errors[detail.path[0]] = detail.message;
        });
        return res.status(400).json({ success: false, errors });
      }

      await locationServices.createLocation(value);
      return res.status(201).json({ success: true, message: 'Tạo địa điểm thành công' });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({ success: false, message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const locationData = { ...req.body };
      if (req.file) {
        locationData.image = req.file;
      }

      const { error, value } = locationValidator.validate(locationData, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          errors[detail.path[0]] = detail.message;
        });
        return res.status(400).json({ success: false, errors });
      }

      await locationServices.updateLocation(id, value);
      return res.status(200).json({ success: true, message: 'Cập nhật địa điểm thành công' });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({ success: false, message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await locationServices.deleteLocation(id);
      return res.status(200).json({ success: true, message: 'Xóa địa điểm thành công' });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({ success: false, message });
    }
  }
};

module.exports = locationController;
