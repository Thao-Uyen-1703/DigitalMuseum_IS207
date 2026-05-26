import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, UserCircle, Package, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Logo from '../layout/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ImageDisplay from '../ui/ImageDisplay';
import {toast} from 'sonner';
import api from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // State cho mini-cart

  const { user, logout } = useAuth();
  const { cart } = useCart(); // Lấy giỏ hàng từ Context

  // Tính tổng số lượng item để hiển thị trên icon (bubble)
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const userMenuRef = useRef(null);
  const cartRef = useRef(null); // Ref để xử lý click outside cho giỏ hàng

  const linkClass = 'relative text-gray-700 text-sm font-semibold py-2 transition-colors duration-300 hover:text-amber-600 group';
  const dropdownItemClass = 'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer';

  // Hàm format tiền tệ
  const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(value || 0));

  useEffect(() => {
    function handleClickOutside(event) {
      // Đóng User Menu nếu click ra ngoài
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      // Đóng Cart Menu nếu click ra ngoài
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="bg-white border-b border-amber-500 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        
        <div className="relative w-24 h-12 flex items-center shrink-0">
          <div className="absolute left-0">
            <Logo />
          </div>
        </div>

        <nav className="hidden md:flex flex-1 mx-8 lg:mx-12">
          <ul className="flex gap-6 lg:gap-8 list-none m-0 p-0">
            <li><Link to="/" className={linkClass}>Trang chủ<span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span></Link></li>
            <li><Link to="#" className={linkClass}>Bảo tàng số<span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span></Link></li>
            <li><Link to="/cua-hang" className={linkClass}>Cửa hàng<span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span></Link></li>
            <li><Link to="/tra-cuu" className={linkClass}>Tra cứu<span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span></Link></li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          
          <div className="hidden lg:flex relative items-center">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 w-32 focus:w-64 transition-all duration-500 ease-in-out"
            />
            <Search className="absolute left-3 text-amber-500" size={18} />
          </div>

          {/* ========================================== */}
          {/* CART DROPDOWN SECTION                      */}
          {/* ========================================== */}
          <div className="relative" ref={cartRef}>
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className={`relative p-2 rounded-full transition-all cursor-pointer group ${
                isCartOpen ? 'bg-amber-100' : 'hover:bg-amber-50'
              }`}
            >
              <ShoppingCart size={22} className="text-amber-600" />
              
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 z-10 flex items-center justify-center bg-white text-amber-700 text-xs font-bold leading-none px-1 min-w-4.5 h-4.5 border border-amber-500 rounded-full shadow-sm pointer-events-none">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Khung Dropdown Giỏ hàng */}
            {isCartOpen && (
              <div className="absolute right-0 mt-2 w-85 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                  <h4 className="text-sm font-bold text-gray-700 m-0">Giỏ hàng của bạn</h4>
                </div>

                <div className="max-h-75 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                      Giỏ hàng trống
                    </div>
                  ) : (
                    <ul className="p-0 m-0 list-none">
                      {/* Chỉ map 4 sản phẩm đầu tiên */}
                      {cart.slice(0, 4).map((item, index) => (
                        <li key={item.productId || index} className="flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                          <ImageDisplay
                            src={item.image}
                            className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h5 className="text-sm font-medium text-gray-800 truncate m-0">
                              {item.productName}
                            </h5>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-amber-600 font-bold">{formatPrice(item.price)}</span>
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer Giỏ hàng */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-100 bg-white">
                    
                    {/* THÊM MỚI: Phần hiển thị Tổng tiền */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-gray-600">Tổng tiền</span>
                      <span className="text-base font-bold text-amber-600">
                        {formatPrice(cart.reduce((total, item) => total + (item.price * item.quantity), 0))}
                      </span>
                    </div>

                    {cart.length > 4 && (
                      <p className="text-xs text-center text-gray-500 mb-3">
                        Và {cart.length - 4} sản phẩm khác trong giỏ
                      </p>
                    )}
                    
                    <Link 
                      to="/gio-hang" 
                      onClick={() => setIsCartOpen(false)}
                      className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                    >
                      Xem toàn bộ giỏ hàng
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* ========================================== */}

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
                    <ImageDisplay 
                      src={user.avatar} 
                      alt="Avatar"
                      type="be"
                      className="w-8 h-8 rounded-full object-cover border border-amber-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                  )}
                  <ChevronDown size={14} className={`text-amber-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              ) : (
                <div className="p-1.5 text-amber-500"><User size={20} /></div>
              )}
            </button>

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
                    <Link to="/thong-tin-ca-nhan" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}><UserCircle size={16} /> Thông tin cá nhân</Link>
                    <hr className="my-1 border-gray-100" />
                    <button className={`${dropdownItemClass} w-full text-red-500 hover:text-red-600 hover:bg-red-50`} onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
                  </>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-full hover:bg-amber-50 text-amber-500 transition-all cursor-pointer">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="md:hidden bg-white border-t border-amber-100 px-4 py-4 space-y-4">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {['Trang chủ', 'Bảo tàng số', 'Cửa hàng', 'Tìm hiểu'].map((item) => (
              <li key={item}><Link to="#" className="text-gray-700 text-sm font-semibold hover:text-amber-500 block" onClick={() => setIsOpen(false)}>{item}</Link></li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}