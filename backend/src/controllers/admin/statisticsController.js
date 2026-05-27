const statisticsServices = require('../../services/admin/statisticsServices');

const statisticsController = {
    getStatistics: async (req, res) => {
        try {
            const { month, year } = req.query;

            if(!month || !year) {
                throw { status: 400, message: "Thông tin không hợp lệ" }
            }

            const results = await statisticsServices.getStatistics(month, year);

            return res.status(200).json({
                success: true,
                data: results
            });

        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    getChartRevenue: async(req, res) => {
        try {
            const year = req.query.year;

            if(!year) {
                throw { status: 400, message: "Thông tin không hợp lệ" }
            }

            const results = await statisticsServices.getChartRevenue(year);

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    getCategoryTopSales: async(req, res) => {
        try {
            const year = req.query.year;

            if(!year) {
                throw { status: 400, message: "Thông tin không hợp lệ" }
            }

            const results = await statisticsServices.getTopCategoriesBySales(year);

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    },

    getRecentOrders: async(req, res) => {
        try {
            const results = await statisticsServices.getRecentOrders();

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (err) {
            const statusCode = err.status || 500;
            const message = err.message || "Lỗi hệ thống máy chủ";
            return res.status(statusCode).json({ success: false, message: message });
        }
    }
};

module.exports = statisticsController;