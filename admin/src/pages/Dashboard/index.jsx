import MainLayout from '../../components/MainLayout';
import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosClient';
import { 
    Users, Package, ShoppingBag, DollarSign, TrendingUp, TrendingDown 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#2C4C3E', '#3b82f6', '#f59e0b', '#10b981'];

const visitsData = [
  { name: 'Sp A', views: 4000 }, { name: 'Sp B', views: 3000 },
  { name: 'Sp C', views: 2000 }, { name: 'Sp D', views: 2780 },
  { name: 'Sp E', views: 1890 }, { name: 'Sp F', views: 5000 },
  { name: 'Sp G', views: 1500 }, { name: 'Sp H', views: 3200 },
  { name: 'Sp I', views: 2100 }, { name: 'Sp J', views: 1100 },
  { name: 'Sp K', views: 900 }, { name: 'Sp L', views: 4500 }
];

const StatCard = ({ title, value, subValue, icon: Icon, isIncrease }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Icon size={24} className="text-[#2C4C3E]" />
            </div>
        </div>
        
        {subValue && (
            <div className="mt-4 flex items-center text-sm">
                {isIncrease === true && <TrendingUp size={16} className="text-green-500 mr-1" />}
                {isIncrease === false && <TrendingDown size={16} className="text-red-500 mr-1" />}
                <span className={isIncrease === true ? 'text-green-500' : isIncrease === false ? 'text-red-500' : 'text-gray-500'}>
                    {subValue}
                </span>
            </div>
        )}
    </div>
);

const getStatusConfig = (status) => {
    switch (status) {
        case 'Pending':
            return {
                label: 'Chờ xử lý',
                className: 'bg-gray-100 text-gray-700'
            };

        case 'Processing':
            return {
                label: 'Đang xử lý',
                className: 'bg-yellow-100 text-yellow-700'
            };

        case 'Shipped':
            return {
                label: 'Đang giao',
                className: 'bg-blue-100 text-blue-700'
            };

        case 'Delivered':
            return {
                label: 'Đã giao',
                className: 'bg-green-100 text-green-700'
            };

        case 'Cancel':
            return {
                label: 'Đã hủy',
                className: 'bg-red-100 text-red-700'
            };

        default:
            return {
                label: status,
                className: 'bg-gray-100 text-gray-700'
            };
    }
};

const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

const formatCurrencyShort = (value) => {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1).replace('.', ',').replace(/,0$/, '') + 'T';
    }
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.', ',').replace(/,0$/, '') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '') + 'K';
    }
    return value.toString();
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        user: { total: 0, diff: 0, growth: null },
        product: { total: 0, activeTotal: 0 },
        order: { total: 0, diff: 0, growth: null },
        revenue: { total: 0, diff: 0, growth: null }
    });

    const [revenueChart, setRevenueChart] = useState([]);
    const [categorySales, setCategorySales] = useState([]);

    const currentYear = new Date().getFullYear();
    const [revenueYear, setRevenueYear] = useState(currentYear);
    const [categoryYear, setCategoryYear] = useState(currentYear);
    const [productViewFilter, setProductViewFilter] = useState('top-5');

    const [orders, setOrders] = useState([]);

    const availableYears = useMemo(() => {
        const startYear = 2024;
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
    }, [currentYear]);

    // const displayVisitsData = useMemo(() => {
    //     const sorted = [...visitsData].sort((a, b) => {
    //         if (productViewFilter.includes('top')) return b.views - a.views;
    //         return a.views - b.views; 
    //     });
    //     const limit = productViewFilter.includes('5') ? 5 : 10;
    //     return sorted.slice(0, limit);
    // }, [productViewFilter]);

    const formatDate = (date) => {
        if (!date) return '---';
        return new Date(date).toLocaleString('vi-VN', { 
            dateStyle: 'medium', 
        });
    };

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const date = new Date();
                const currentMonth = date.getMonth() + 1;

                const response = await api.get('/admin/statistics/overview', {
                    params: { month: currentMonth, year: currentYear }
                });
                 
                setStats(response.data.data || response.data);
            } catch (error) {
                toast.error("Lỗi khi lấy dữ liệu thống kê:", error);
            }
        };

        fetchStatistics();
    }, [currentYear]);

    useEffect(() => {
        const fetchRevenueChart = async () => {
            try {
                const response = await api.get('/admin/statistics/chart/revenue', {
                    params: { year: revenueYear }
                });
                
                setRevenueChart(response.data.data || response.data);
            } catch (error) {
                toast.error("Lỗi khi lấy dữ liệu biểu đồ doanh thu:");
            }
        };

        fetchRevenueChart();
    }, [revenueYear]);

    useEffect(() => {
        const fetchCategorySales = async () => {
            try {
                const response = await api.get('/admin/statistics/chart/category', {
                    params: { year: categoryYear }
                });

                setCategorySales(response.data.data || response.data);
            } catch (error) {
                toast.error("Lỗi khi lấy dữ liệu danh mục sản phẩm:");
            }
        };

        fetchCategorySales();
    }, [categoryYear]);

    useEffect(() => {
        const fetchOrdersList = async() => {
            try {
                const response = await api.get('/admin/statistics/chart/recent-orders');

                setOrders(response.data.data || response.data);
            } catch (error) {
                toast.error("Lỗi khi lấy các đơn hàng gần đây")
            }
        }

        fetchOrdersList();
    }, []);

    const generateGrowthText = (diff, growth, label) => {
        if (growth === null) return null; 
        const sign = diff > 0 ? '+' : '';
        return `${sign}${diff} ${label} (${growth}%)`;
    };

    const generateRevenueGrowthText = (diff, growth) => {
        if (growth === null) return null;
        const sign = diff > 0 ? '+' : '';
        return `${sign}${formatMoney(Math.abs(diff))} (${growth}%)`;
    };

    return (
        <MainLayout>
            <div className="space-y-6 pb-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thống kê & Báo cáo</h1>
                    <p className="text-gray-500 text-sm mt-1">Tình hình hoạt động chung</p>
                </div>

                {/* Bốn Block Thống Kê */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Tổng Users" 
                        value={stats.user.total} 
                        subValue={generateGrowthText(stats.user.diff, stats.user.growth, 'user')} 
                        icon={Users} 
                        isIncrease={stats.user.diff > 0} 
                    />
                    <StatCard 
                        title="Tổng Sản Phẩm" 
                        value={stats.product.total} 
                        subValue={`${stats.product.activeTotal} đang hoạt động`} 
                        icon={Package} 
                        isIncrease={null}
                    />
                    <StatCard 
                        title="Tổng Đơn Hàng" 
                        value={stats.order.total} 
                        subValue={generateGrowthText(stats.order.diff, stats.order.growth, 'đơn')} 
                        icon={ShoppingBag} 
                        isIncrease={stats.order.diff > 0} 
                    />
                    <StatCard 
                        title="Tổng Doanh Thu" 
                        value={formatMoney(stats.revenue.total)} 
                        subValue={generateRevenueGrowthText(stats.revenue.diff, stats.revenue.growth)} 
                        icon={DollarSign} 
                        isIncrease={stats.revenue.diff > 0} 
                    />
                </div>

                {/* Dòng 1 Chart: Doanh thu & Danh mục */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Doanh thu theo năm</h3>
                            <select 
                                value={revenueYear} 
                                onChange={(e) => setRevenueYear(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>Năm {year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2C4C3E" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2C4C3E" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
                                    
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    
                                    <RechartsTooltip 
                                        wrapperClassName="rounded-lg shadow-lg border-0" 
                                        formatter={(value) => [formatMoney(value), "Doanh thu"]}
                                    />
                                    
                                    <Area type="monotone" dataKey="revenue" stroke="#2C4C3E" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Danh mục nổi bật</h3>
                            <select 
                                value={categoryYear} 
                                onChange={(e) => setCategoryYear(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>Năm {year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="h-72">
                            {categorySales.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center">
                                    Không có dữ liệu
                                </p>
                            ) : (
                            <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                <PieChart>
                                    <Pie data={categorySales} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categorySales.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dòng 2 Chart: Lượt truy cập SP */}
                {/* <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Lượt truy cập sản phẩm</h3>
                        <select 
                            value={productViewFilter} 
                            onChange={(e) => setProductViewFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="top-5">5 nhiều nhất</option>
                            <option value="top-10">10 nhiều nhất</option>
                            <option value="bottom-5">5 ít nhất</option>
                            <option value="bottom-10">10 ít nhất</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" debounce={300}>
                            <BarChart data={displayVisitsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={30}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                                <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div> */}

                {/* Bảng Đơn Hàng */}
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h3>
                        <button className="text-sm text-blue-600 hover:underline font-medium">Xem tất cả</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left min-w-[650px]">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-t-lg">
                                <tr className="text-center">
                                    <th className="px-4 py-3 rounded-tl-lg">Mã ĐH</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Ngày</th>
                                    <th className="px-4 py-3">Tổng tiền</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => {
                                    const { label, className } = getStatusConfig(order.status);

                                    return (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-center">
                                            <td className="px-4 py-3 font-medium text-gray-900">{order.orderTracking}</td>
                                            <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                                            <td className="px-4 py-3 text-gray-500">{formatDate(order.date)}</td>
                                            <td className="px-4 py-3 font-medium">{formatMoney(order.total)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
                                                    {label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}