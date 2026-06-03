const orderServices = require('../../services/admin/orderServices');

const orderController = {
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
        } catch (error) {
          sortConfigs = [];
        }
      }

      const filters = { page, perPage, search, sortConfigs };
      const data = await orderServices.getOrders(filters);

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

  getDetails: async (req, res) => {
    try {
      const { id } = req.params;

      if(!id) {
        throw {status: 400, message: "Vui lòng nhập đủ thông tin"}
      }

      const data = await orderServices.getOrderDetails(id);

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

  create: async (req, res) => {
    try {
      const payload = req.body;
      const data = await orderServices.createOrder(payload);

      return res.status(201).json({
        success: true,
        data,
        message: 'Tạo đơn hàng thành công'
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

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const data = await orderServices.updateOrder(id, payload);

      return res.status(200).json({
        success: true,
        data,
        message: 'Cập nhật đơn hàng thành công'
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

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await orderServices.deleteOrder(id);

      return res.status(200).json({
        success: true,
        message: 'Xóa đơn hàng thành công'
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

module.exports = orderController;
