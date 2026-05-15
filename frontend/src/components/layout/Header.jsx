import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, UserCircle, Package, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Logo from '../layout/Logo';
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  const cartItemsCount = 0;
  const userMenuRef = useRef(null);

  const linkClass = 'relative text-gray-700 text-sm font-semibold py-2 transition-colors duration-300 hover:text-amber-600 group';
  const dropdownItemClass = 'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer';

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // Navbar với Border Bottom màu vàng (amber-500)
    <header className="bg-white border-b border-amber-500 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        
        {/* Logo giữ nguyên kích thước để không đẩy Nav */}
        <div className="relative w-24 h-12 flex items-center shrink-0">
          <div className="absolute left-0">
            <Logo />
          </div>
        </div>

        {/* Navigation với Underline Animation */}
        <nav className="hidden md:flex flex-1 mx-8 lg:mx-12">
          <ul className="flex gap-6 lg:gap-8 list-none m-0 p-0">
            <li>
              <Link to="/" className={linkClass}>
                Trang chủ
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
            <li>
              <Link to="#" className={linkClass}>
                Bảo tàng số
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
            <li>
              <Link to="/cua-hang" className={linkClass}>
                Cửa hàng
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
            <li>
              <Link to="#" className={linkClass}>
                Tìm hiểu
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Header Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Search Bar: Icon vàng và Hiệu ứng rộng ra khi focus */}
          <div className="hidden lg:flex relative items-center">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm outline-none 
                         focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 
                         w-32 focus:w-64 transition-all duration-500 ease-in-out"
            />
            <Search className="absolute left-3 text-amber-500" size={18} />
          </div>

          {/* Icons màu vàng */}
          <button className="relative p-2 rounded-full hover:bg-amber-50 text-amber-500 transition-all cursor-pointer group">
            <ShoppingCart size={22} className="text-amber-600" />
            
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 z-10 flex items-center justify-center 
                              bg-white text-amber-700 text-[11px] font-bold 
                              leading-none px-1 min-w-[18px] h-[18px] 
                              border border-amber-500 rounded-full
                              shadow-sm pointer-events-none">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </button>
          {/* USER MENU SECTION */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-1 p-1 rounded-full transition-all cursor-pointer ${
                isUserMenuOpen ? 'bg-amber-100' : 'hover:bg-amber-50'
              }`}
            >
              {user ? (
                <div className="flex items-center gap-1">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-amber-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                  )}
                  <ChevronDown 
                    size={14} 
                    className={`text-amber-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  />
                </div>
              ) : (
                <div className="p-1.5 text-amber-500">
                  <User size={20} />
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                {!user ? (
                  <>
                    <Link to="/dang-nhap" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>Đăng nhập</Link>
                    <Link to="/dang-ky" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>Đăng ký</Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400">Tài khoản</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{user.name || user.email}</p>
                    </div>
                    <Link to="/profile" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>
                      <UserCircle size={16} /> Thông tin cá nhân
                    </Link>
                    <Link to="/orders" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>
                      <Package size={16} /> Đơn hàng
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      className={`${dropdownItemClass} w-full text-red-500 hover:text-red-600 hover:bg-red-50`}
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Button cho màn hình nhỏ - Giữ nguyên logic */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-amber-50 text-amber-500 transition-all cursor-pointer"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-amber-100 px-4 py-4 space-y-4">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {['Trang chủ', 'Bảo tàng số', 'Cửa hàng', 'Tìm hiểu'].map((item) => (
              <li key={item}>
                <Link to="#" className="text-gray-700 text-sm font-semibold hover:text-amber-500 block" onClick={() => setIsOpen(false)}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}