const userModel = require('../../models/userModel');
const productModel = require('../../models/productModel');
const orderModel = require('../../models/orderModel');

const statisticsServices = {
    getStatistics: async (month, year) => {
        const { previousMonth, previousYear } = statisticsServices.getLastMonth(month, year);

        const [
            currentMonthUsers,
            totalUsers,

            totalProducts,
            activeProducts,

            currentMonthOrders,
            totalOrders,

            currentMonthRevenue,
            totalRevenue
        ] = await Promise.all([
            userModel.getUsersCountByMonth(month, year),
            userModel.getUsersCount(),

            productModel.getProductsCount(),
            productModel.getProductsCountByStatus(1),

            orderModel.getOrdersCountByMonth(month, year),
            orderModel.getOrdersCount(),

            orderModel.getOrdersRevenueByMonth(month, year),
            orderModel.getOrdersRevenue()
        ]);

        const payload = {
            user: {
                total: totalUsers,
                currentMonth: currentMonthUsers
            },
            product: {
                total: totalProducts,
                activeTotal: activeProducts
            },
            order: {
                total: totalOrders,
                currentMonth: currentMonthOrders
            },
            revenue: {
                total: totalRevenue,
                currentMonth: currentMonthRevenue
            }
        }

        return payload;
    },

    getLastMonth: (month, year) => {
        let previousMonth = month - 1;
        let previousYear = year;

        if (previousMonth === 0) {
            previousMonth = 12;
            previousYear--;
        }

        return { previousMonth, previousYear }
    },

    getDiff: (current, last) => {
        const diff = current - last;

        if (last === 0) {
            return {
                diff,
                growth: null
            };
        }

        const growth = (diff / last) * 100;

        return { diff, growth: Number(growth.toFixed(1)) }
    },

    getChartRevenue: async (year) => {
        const data = await orderModel.getOrdersRevenueByYear(year);

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const maxMonth =
            Number(year) === currentYear ? currentMonth : 12;

        const revenueMap = new Map();

        data.forEach(item => {
            revenueMap.set(item.month, item.revenue);
        });

        const chartData = Array.from(
            { length: maxMonth },
            (_, index) => {
                const month = index + 1;

                return { month: "T" + month, revenue: revenueMap.get(month) || 0 }
            }
        )

        return chartData;
    },

    getTopCategoriesBySales: async(year) => {
        const data = await orderModel.getTopCategoriesBySales(year);
        return data;
    },

    getRecentOrders: async () => {
        const data = await orderModel.getOrders(10);

        return data.map(order => ({
            id: order.OrderID,
            customerName: order.UserID ? order.FullName : "Khách hàng ẩn danh",
            orderTracking: order.OrderTracking,
            total: Number(order.TotalAmount),
            date: order.OrderDate,
            status: order.Status
        }));
    }
};

module.exports = statisticsServices;