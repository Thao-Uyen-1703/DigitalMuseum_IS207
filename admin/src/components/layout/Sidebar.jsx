import React, { useState } from 'react';
import { 
  LayoutDashboard, MapPin, Package, ShoppingCart, 
  FileText, Settings, Menu, X, User, LogOut 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { title: 'Thống kê', icon: LayoutDashboard, navigate: '/' },
  { title: 'Địa điểm', icon: MapPin, navigate: '/dia-diem'},
  { title: 'Sản phẩm', icon: Package, navigate: '/san-pham'},
  { title: 'Đơn hàng', icon: ShoppingCart, navigate: '/don-hang' },
  { title: 'Quản lý blog', icon: FileText, navigate: '/blog' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');

      await logout();

      navigate('/');

    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra khi đăng xuất");
    }
  }

  return (
    <aside 
      className={`bg-[#2C4C3E] border-r border-white/10 flex flex-col transition-all duration-300 z-30 shadow-2xl md:shadow-lg text-gray-300
        absolute inset-y-0 left-0 transform md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-20'}
      `}
    >
      {/* Header / Logo */}
      <div className={`h-16 flex items-center border-b border-white/10 ${isOpen ? 'justify-between px-4' : 'justify-center'}`}>
        {isOpen && <span className="font-bold text-lg text-white truncate">Admin Panel</span>}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
        >
          {/* Trên desktop thu gọn hiện Menu, mở ra hiện X */}
          {isOpen ? <X size={20} /> : <Menu size={20} className="hidden md:block" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            onClick={() => {navigate(item.navigate)}}
            className={`flex items-center p-3 rounded-lg hover:bg-white/10 hover:text-white cursor-pointer transition-colors group
              ${isOpen ? 'justify-start' : 'justify-center'}
            `}
            title={!isOpen ? item.title : ""}
          >
            <item.icon size={22} className="flex-shrink-0" />
            {isOpen && (
              <span className="ml-4 text-sm font-medium whitespace-nowrap">
                {item.title}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Footer / User Info */}
      <div className={`relative p-4 border-t border-white/10 flex ${isOpen ? 'flex-row items-center justify-between' : 'flex-col items-center gap-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold backdrop-blur-sm">
            HT
          </div>
          {isOpen && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-sm font-semibold truncate text-white">Hoàng Trung</span>
              <span className="text-xs text-gray-400">Super Admin</span>
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className={`p-2 rounded-full transition-colors ${isDropdownOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
          >
            <Settings size={20} />
          </button>

          {isDropdownOpen && (
            <div className={`absolute bottom-full mb-3 bg-[#1e352b] border border-white/10 shadow-2xl rounded-lg py-2 z-50 w-48 
              ${isOpen ? 'right-0' : 'left-8 bottom-[-10px]'} 
            `}>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
                <User size={16} /> Thông tin cá nhân
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 flex items-center gap-3 transition-colors">
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;