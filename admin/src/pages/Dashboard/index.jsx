import MainLayout from '../../components/MainLayout';
import { useState, useEffect } from 'react';
import { 
    Users, Package, ShoppingBag, DollarSign, TrendingUp, TrendingDown 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const revenueData = [
  { name: 'T1', total: 1200 }, { name: 'T2', total: 2100 }, { name: 'T3', total: 1800 },
  { name: 'T4', total: 3200 }, { name: 'T5', total: 2800 }, { name: 'T6', total: 4300 },
];

const categoryData = [
  { name: 'Điện thoại', value: 400 }, { name: 'Laptop', value: 300 },
  { name: 'Phụ kiện', value: 300 }, { name: 'Smartwatch', value: 200 },
];
const COLORS = ['#2C4C3E', '#3b82f6', '#f59e0b', '#10b981'];

const visitsData = [
  { name: 'Sp A', views: 4000 }, { name: 'Sp B', views: 3000 },
  { name: 'Sp C', views: 2000 }, { name: 'Sp D', views: 2780 },
  { name: 'Sp E', views: 1890 },
];

const recentOrders = Array.from({ length: 10 }).map((_, i) => ({
  id: `#ORD00${i + 1}`,
  customer: `Khách hàng ${i + 1}`,
  date: `2026-05-${String(26 - i).padStart(2, '0')}`,
  total: (Math.random() * 5000000 + 500000).toFixed(0),
  status: i % 3 === 0 ? 'Đang xử lý' : i % 5 === 0 ? 'Đã hủy' : 'Hoàn thành'
}));

const StatCard = ({ title, value, subValue, icon: Icon, isIncrease }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Icon size={24} className="text-[#2C4C3E]" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            {isIncrease === true && <TrendingUp size={16} className="text-green-500 mr-1" />}
            {isIncrease === false && <TrendingDown size={16} className="text-red-500 mr-1" />}
            <span className={isIncrease === true ? 'text-green-500' : isIncrease === false ? 'text-red-500' : 'text-gray-500'}>
                {subValue}
            </span>
        </div>
    </div>
);

const getStatusColor = (status) => {
    switch(status) {
        case 'Hoàn thành': return 'bg-green-100 text-green-700';
        case 'Đang xử lý': return 'bg-yellow-100 text-yellow-700';
        case 'Đã hủy': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

export default function Dashboard() {
    return (
        <MainLayout>
            <div className="space-y-6 pb-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thống kê & Báo cáo</h1>
                    <p className="text-gray-500 text-sm mt-1">Tình hình hoạt động chung</p>
                </div>

                {/* 1. Bốn Block Thống Kê */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Tổng Users" value="12,345" subValue="+234 user trong tháng" 
                        icon={Users} isIncrease={true} 
                    />
                    <StatCard 
                        title="Tổng Sản Phẩm" value="842" subValue="820 đang hoạt động" 
                        icon={Package} isIncrease={null} 
                    />
                    <StatCard 
                        title="Tổng Đơn Hàng" value="1,240" subValue="+15% so với tháng trước" 
                        icon={ShoppingBag} isIncrease={true} 
                    />
                    <StatCard 
                        title="Tổng Doanh Thu" value="145.2M ₫" subValue="+12.5M ₫ trong tháng" 
                        icon={DollarSign} isIncrease={true} 
                    />
                </div>

                {/* 2. Biểu đồ Doanh thu & Biểu đồ Tròn */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Doanh Thu (Chiếm 2 cột) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo tháng</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2C4C3E" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2C4C3E" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <RechartsTooltip wrapperClassName="rounded-lg shadow-lg border-0" />
                                    <Area type="monotone" dataKey="total" stroke="#2C4C3E" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart Tròn Phân loại (Chiếm 1 cột) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh mục được mua</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Lượt truy cập SP & Bảng Đơn Hàng */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Cột Lượt truy cập (Chiếm 1 cột) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lượt truy cập sản phẩm</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={visitsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={30}>
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bảng Đơn Hàng (Chiếm 2 cột) */}
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h3>
                            <button className="text-sm text-blue-600 hover:underline font-medium">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left min-w-[650px]">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-t-lg">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Mã ĐH</th>
                                        <th className="px-4 py-3">Khách hàng</th>
                                        <th className="px-4 py-3">Ngày</th>
                                        <th className="px-4 py-3">Tổng tiền</th>
                                        <th className="px-4 py-3 rounded-tr-lg">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, index) => (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                                            <td className="px-4 py-3 text-gray-600">{order.customer}</td>
                                            <td className="px-4 py-3 text-gray-500">{order.date}</td>
                                            <td className="px-4 py-3 font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}