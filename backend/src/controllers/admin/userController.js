const bcrypt = require('bcrypt');
const userServices = require('../../services/admin/userServices');
const userValidator = require('../../validators/userValidator');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const search = req.query.search || '';
      const role = req.query.role || '';

      let sortConfigs = [];
      const sortQuery = req.query.sortConfigs || req.query.sortConfig;
      if (sortQuery) {
        try {
          sortConfigs = JSON.parse(sortQuery);
        } catch (e) {
          sortConfigs = [];
        }
      }

      const filters = { page, perPage, search, role, sortConfigs };
      const data = await userServices.getUsersFilter(filters);

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({
        success: false,
        message
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const { error, value } = userValidator.validate(req.body, { abortEarly: false });
      if (error || !value) {
        const errorDetails = {};
        if (error) {
          error.details.forEach(detail => {
            errorDetails[detail.path[0]] = detail.message;
          });
        }

        return res.status(400).json({
          success: false,
          errors: errorDetails
        });
      }

      const passwordHash = await bcrypt.hash('123456', 10);
      await userServices.createUser({
        ...value,
        PasswordHash: passwordHash,
        IsActive: value.IsActive === false ? 0 : 1
      });

      return res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công'
      });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({
        success: false,
        message
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw { status: 400, message: 'Vui lòng điền đủ thông tin' };
      }

      const { error, value } = userValidator.validate(req.body, { abortEarly: false });
      if (error || !value) {
        const errorDetails = {};
        if (error) {
          error.details.forEach(detail => {
            errorDetails[detail.path[0]] = detail.message;
          });
        }

        return res.status(400).json({
          success: false,
          errors: errorDetails
        });
      }

      await userServices.updateUser(id, value);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật người dùng thành công'
      });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Lỗi hệ thống';
      return res.status(status).json({
        success: false,
        message
      });
    }
  }
};

module.exports = userController;
