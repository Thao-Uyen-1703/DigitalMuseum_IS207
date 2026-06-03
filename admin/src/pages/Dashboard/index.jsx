import MainLayout from '../../components/MainLayout';
import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosClient';
import { 
    Users, Package, ShoppingBag, DollarSign, TrendingUp, TrendingDown, 
    Inbox, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#2C4C3E', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

// Component tái sử dụng cho trạng thái trống (Không có dữ liệu)
const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 animate-in fade-in duration-500">
        <div className="p-4 bg-gray-50 rounded-full">
            <Icon size={32} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium">{message}</p>
    </div>
);

// Component tái sử dụng cho trạng thái đang tải
const LoadingState = () => (
    <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-green-600 rounded-full animate-spin"></div>
    </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, isIncrease }) => (
    <div className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300 flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{title}</p>
                <h3 className="text-2xl font-black text-gray-800">{value}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-green-50 transition-colors duration-300">
                <Icon size={22} className="text-[#2C4C3E] group-hover:text-green-600 transition-colors duration-300" />
            </div>
        </div>
        
        {subValue && (
            <div className="mt-4 flex items-center text-[13px] font-medium">
                {isIncrease === true && <TrendingUp size={16} className="text-green-500 mr-1.5" />}
                {isIncrease === false && <TrendingDown size={16} className="text-red-500 mr-1.5" />}
                <span className={isIncrease === true ? 'text-green-600' : isIncrease === false ? 'text-red-600' : 'text-gray-500'}>
                    {subValue}
                </span>
            </div>
        )}
    </div>
);

const orderStatusMap = {
  Pending: { label: 'Chờ xử lý', className: 'bg-orange-50 text-orange-600 border-orange-100' },
  Processing: { label: 'Đang chuẩn bị', className: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  Delivering: { label: 'Đang giao hàng', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  Completed: { label: 'Hoàn tất', className: 'bg-green-50 text-green-600 border-green-100' },
  Canceled: { label: 'Đã hủy', className: 'bg-red-50 text-red-600 border-red-100' }
};

const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0));
};

const formatCurrencyShort = (value) => {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' Tỷ';
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' Tr';
    if (value >= 1000) return (value / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' K';
    return value.toString();
};

export default function Dashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        user: { total: 0, currentMonth: 0 },
        product: { total: 0, activeTotal: 0 },
        order: { total: 0, currentMonth: 0 },
        revenue: { total: 0, currentMonth: 0 }
    });

    const [revenueChart, setRevenueChart] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [orders, setOrders] = useState([]);

    // Filter states
    const currentYear = new Date().getFullYear();
    const [revenueYear, setRevenueYear] = useState(currentYear);
    const [categoryYear, setCategoryYear] = useState(currentYear);

    // Loading states
    const [isFetchingStats, setIsFetchingStats] = useState(true);
    const [isFetchingRevenue, setIsFetchingRevenue] = useState(true);
    const [isFetchingCategory, setIsFetchingCategory] = useState(true);
    const [isFetchingOrders, setIsFetchingOrders] = useState(true);

    const availableYears = useMemo(() => {
        const startYear = 2024;
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
    }, [currentYear]);

    const formatDate = (date) => {
        if (!date) return '---';
        const d = new Date(date);
        return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN')}`;
    };

    // --- FETCH DATA ---
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
                toast.error("Lỗi khi lấy dữ liệu tổng quan");
            } finally {
                setIsFetchingStats(false);
            }
        };
        fetchStatistics();
    }, [currentYear]);

    useEffect(() => {
        const fetchRevenueChart = async () => {
            setIsFetchingRevenue(true);
            try {
                const response = await api.get('/admin/statistics/chart/revenue', {
                    params: { year: revenueYear }
                });
                setRevenueChart(response.data.data || response.data);
            } catch (error) {
                toast.error("Lỗi khi lấy biểu đồ doanh thu");
            } finally {
                setIsFetchingRevenue(false);
            }
        };
        fetchRevenueChart();
    }, [revenueYear]);

    useEffect(() => {
        const fetchCategorySales = async () => {
            setIsFetchingCategory(true);
            try {
                const response = await api.get('/admin/statistics/chart/category', {
                    params: { year: categoryYear }
                });
                setCategorySales(response.data.data || response.data);
            } catch (error) {
                toast.error("Lỗi khi lấy dữ liệu danh mục");
            } finally {
                setIsFetchingCategory(false);
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
                toast.error("Lỗi khi lấy đơn hàng gần đây");
            } finally {
                setIsFetchingOrders(false);
            }
        }
        fetchOrdersList();
    }, []);

    return (
        <MainLayout>
            <div className="space-y-6 pb-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Thống kê & Báo cáo</h1>
                        <p className="text-gray-500 text-sm mt-1">Theo dõi tình hình hoạt động kinh doanh của cửa hàng</p>
                    </div>
                </div>

                {/* 1. Bốn Block Thống Kê */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard 
                        title="Tổng Khách Hàng" 
                        value={isFetchingStats ? '...' : stats.user.total} 
                        subValue={`+${stats.user.currentMonth || 0} trong tháng`} 
                        icon={Users} 
                        isIncrease={true}
                    />
                    <StatCard 
                        title="Sản Phẩm" 
                        value={isFetchingStats ? '...' : stats.product.total} 
                        subValue={`${stats.product.activeTotal} đang mở bán`} 
                        icon={Package} 
                        isIncrease={null}
                    />
                    <StatCard 
                        title="Tổng Đơn Hàng" 
                        value={isFetchingStats ? '...' : stats.order.total} 
                        subValue={`+${stats.order.currentMonth || 0} trong tháng`} 
                        icon={ShoppingBag} 
                        isIncrease={true} 
                    />
                    <StatCard 
                        title="Doanh Thu Tổng" 
                        value={isFetchingStats ? '...' : formatMoney(stats.revenue.total)} 
                        subValue={`+${formatMoney(stats.revenue.currentMonth || 0)} tháng này`} 
                        icon={DollarSign} 
                        isIncrease={true} 
                    />
                </div>

                {/* 2. Dòng 1 Chart: Doanh thu & Danh mục */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Biểu đồ Doanh Thu */}
                    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Thống kê doanh thu theo từng tháng</p>
                            </div>
                            <select 
                                value={revenueYear} 
                                onChange={(e) => setRevenueYear(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>Năm {year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="h-72 flex-1">
                            {isFetchingRevenue ? <LoadingState /> : revenueChart.every(item => item.revenue === 0) ? (
                                <EmptyState icon={BarChart3} message={`Không có doanh thu trong năm ${revenueYear}`} />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                    <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2C4C3E" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#2C4C3E" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} dx={-10} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <RechartsTooltip 
                                            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [formatMoney(value), "Doanh thu"]}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#2C4C3E" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 6, fill: '#2C4C3E', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Cơ cấu danh mục</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Phân bổ sản phẩm bán ra</p>
                            </div>
                            <select 
                                value={categoryYear} 
                                onChange={(e) => setCategoryYear(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>Năm {year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-80 flex-1 min-h-[320px]">
                            {isFetchingCategory ? <LoadingState /> : categorySales.length === 0 ? (
                                <EmptyState icon={PieChartIcon} message={`Chưa bán được sản phẩm nào trong năm ${categoryYear}`} />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                    <PieChart>
                                        <Pie 
                                            data={categorySales} 
                                            cx="50%" 
                                            cy="50%" // Đưa về chính giữa 
                                            innerRadius="50%" // Dùng % để tự co giãn
                                            outerRadius="70%" // Dùng % để tự co giãn
                                            paddingAngle={5} 
                                            dataKey="value" 
                                            stroke="none"
                                        >
                                            {categorySales.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [value + ' sản phẩm', "Đã bán"]}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            align="center"
                                            iconType="circle" 
                                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Bảng Đơn Hàng Gần Đây */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Đơn hàng mới nhất</h3>
                            <p className="text-xs text-gray-400 mt-0.5">10 giao dịch vừa phát sinh</p>
                        </div>
                        <button
                            onClick={() => navigate('/don-hang')}
                            className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                            Xem tất cả &rarr;
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {isFetchingOrders ? (
                            <div className="py-20"><LoadingState /></div>
                        ) : orders.length === 0 ? (
                            <div className="py-16"><EmptyState icon={Inbox} message="Chưa có đơn hàng nào phát sinh gần đây." /></div>
                        ) : (
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-[11px] font-bold text-gray-500 uppercase bg-gray-50/80 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Mã ĐH</th>
                                        <th className="px-6 py-4">Khách hàng</th>
                                        <th className="px-6 py-4">Ngày giao dịch</th>
                                        <th className="px-6 py-4 text-right">Tổng tiền</th>
                                        <th className="px-6 py-4 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map((order, index) => {
                                        const { label, className } = orderStatusMap[order.status] || { label: order.status, className: 'bg-gray-50 text-gray-600' };

                                        return (
                                            <tr key={index} className="hover:bg-blue-50/40 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-blue-600 text-sm">#{order.orderTracking}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800">{order.customerName}</td>
                                                <td className="px-6 py-4 text-gray-500 text-[13px]">{formatDate(order.date)}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 text-right">{formatMoney(order.total)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${className}`}>
                                                        {label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}