import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Ticket, ArrowLeft, ShoppingBag } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useCart } from '../context/CartContext';
import ImageDisplay from '../components/ui/ImageDisplay';

export default function CartPage() {
  // Lấy thêm updateQuantity và removeFromCart từ Context
  const { cart, updateCartItemQuantity, removeFromCart } = useCart();
  const navigate = useNavigate(); 

  // 1. STATE QUẢN LÝ CÁC SẢN PHẨM ĐƯỢC CHỌN (Mảng chứa danh sách các productId)
  const [selectedItems, setSelectedItems] = useState([]);
  
  // 2. STATE QUẢN LÝ MÃ COUPON
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0); // Số tiền được giảm bớt
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // Hàm format tiền tệ VNĐ
  const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(value || 0));

  // ==========================================
  // XỬ LÝ LOGIC HIỂN THỊ HÓA ĐƠN
  // ==========================================
  
  const selectedCartItems = useMemo(() => {
    return cart.filter((item) => selectedItems.includes(item.productId));
  }, [cart, selectedItems]);

  const selectedSubtotal = useMemo(() => {
    return selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [selectedCartItems]);

  const totalSelectedQuantity = useMemo(() => {
    return selectedCartItems.reduce((total, item) => total + item.quantity, 0);
  }, [selectedCartItems]);

  const finalTotal = useMemo(() => {
    const total = selectedSubtotal - discountAmount;
    return total < 0 ? 0 : total;
  }, [selectedSubtotal, discountAmount]);

  // ==========================================
  // HÀM ĐIỀU KHIỂN GIAO DIỆN (UI HANDLERS)
  // ==========================================
  
  const handleSelectItem = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]); 
    } else {
      const allIds = cart.map((item) => item.productId);
      setSelectedItems(allIds); 
    }
  };

  // Hàm xử lý xóa nhiều mục đã chọn
  const handleRemoveSelected = () => {
    removeFromCart(selectedItems);
    setSelectedItems([]);
  };

  const handleCheckout = () => {
    navigate('/thanh-toan', { state: { checkoutItems: selectedCartItems, subtotal: finalTotal } });
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-12">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h1 className="font-['Lora'] text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <ShoppingBag className="text-[#b5995e]" /> Giỏ hàng của bạn
          </h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm max-w-xl mx-auto">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-[#b5995e]" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng hiện đang trống</h2>
              <p className="text-gray-500 mb-8 text-sm">Hãy ghé thăm không gian trưng bày để chọn cho mình những món quà lưu niệm ý nghĩa.</p>
              <Link to="/cua-hang" className="inline-flex items-center gap-2 bg-[#b5995e] hover:brightness-110 text-white font-bold py-3 px-6 rounded-xl transition shadow">
                <ArrowLeft size={16} /> Quay lại Cửa hàng
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-4">
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <label className="flex items-center gap-3 font-medium text-sm text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cart.length > 0 && selectedItems.length === cart.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    Chọn tất cả ({cart.length} sản phẩm)
                  </label>
                  
                  {/* GẮN SỰ KIỆN XÓA NHIỀU MỤC */}
                  {selectedItems.length > 0 && (
                    <button 
                      onClick={handleRemoveSelected}
                      className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition"
                    >
                      <Trash2 size={16} /> Xóa mục đã chọn ({selectedItems.length})
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {cart.map((item) => {
                    const isChecked = selectedItems.includes(item.productId);
                    return (
                      <div 
                        key={item.productId} 
                        className={`bg-white p-4 sm:p-5 rounded-xl border transition shadow-sm flex gap-4 items-center ${
                          isChecked ? 'border-amber-500/40 bg-amber-50/10' : 'border-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectItem(item.productId)}
                          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer shrink-0"
                        />

                        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <ImageDisplay src={item.image} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          <div className="md:col-span-6">
                            <h3 className="font-medium text-gray-800 text-base truncate mb-1">
                              {item.productName}
                            </h3>
                            <span className="text-sm text-amber-600 font-bold">
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          <div className="md:col-span-4 flex items-center justify-start md:justify-center">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9 w-28 bg-white">
                              {/* GẮN SỰ KIỆN GIẢM SỐ LƯỢNG */}
                              <button 
                                onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                                className="hover:bg-gray-50 text-gray-600 px-2 h-full border-r border-gray-200 font-bold transition flex items-center justify-center shrink-0"
                              >
                                <Minus size={14} />
                              </button>
                              
                              <input
                                type="text"
                                readOnly
                                value={item.quantity}
                                className="w-full text-center border-0 focus:ring-0 font-medium text-sm text-gray-800 bg-transparent p-0"
                              />
                              
                              {/* GẮN SỰ KIỆN TĂNG SỐ LƯỢNG */}
                              <button 
                                onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                className="hover:bg-gray-50 text-gray-600 px-2 h-full border-l border-gray-200 font-bold transition flex items-center justify-center shrink-0"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                            <span className="font-bold text-gray-800 text-sm hidden md:block">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            {/* GẮN SỰ KIỆN XÓA 1 SẢN PHẨM */}
                            <button 
                              onClick={() => {
                                removeFromCart(item.productId);
                                setSelectedItems(prev => prev.filter(id => id !== item.productId));
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-50 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <Link to="/cua-hang" className="inline-flex items-center gap-2 text-sm font-semibold text-[#b5995e] hover:text-amber-700 transition">
                  <ArrowLeft size={16} /> Tiếp tục khám phá sản phẩm khác
                </Link>
              </div>

              {/* PHẦN BÊN PHẢI GIỮ NGUYÊN NHƯ CŨ */}
              <div className="lg:col-span-4 space-y-4">
                
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Ticket size={16} className="text-amber-600" /> Mã giảm giá / Ưu đãi
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã ưu đãi..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isCouponApplied}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 uppercase font-mono disabled:bg-gray-50"
                    />
                    <button 
                      className={`px-4 py-2 text-sm font-bold rounded-xl transition ${
                        isCouponApplied 
                          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                          : 'bg-[#b5995e] hover:brightness-110 text-white'
                      }`}
                    >
                      {isCouponApplied ? 'Hủy' : 'Áp dụng'}
                    </button>
                  </div>
                  {isCouponApplied && (
                    <p className="text-xs text-green-600 font-medium mt-2">
                      ✓ Đã áp dụng mã thành công!
                    </p>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-['Lora'] text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 m-0">
                    Tóm tắt đơn hàng
                  </h3>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Tổng sản phẩm đã chọn:</span>
                      <span className="font-medium text-gray-800">{totalSelectedQuantity} sản phẩm</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-500">
                      <span>Thành tiền tạm tính:</span>
                      <span className="font-semibold text-gray-800">{formatPrice(selectedSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>Giảm giá (Coupon):</span>
                      <span className="font-semibold text-green-600">-{formatPrice(discountAmount)}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-800">Tổng cộng thanh toán:</span>
                    <span className="text-2xl font-black text-[#b5995e] font-sans">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                  <button 
                    disabled={selectedItems.length === 0}
                    onClick={handleCheckout}
                    className={`w-full font-bold text-base py-4 rounded-xl shadow transition duration-300 flex items-center justify-center gap-2
                      ${selectedItems.length === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                        : 'bg-[#b5995e] hover:brightness-110 text-white active:scale-[0.99]'}`}
                  >
                    TIẾN HÀNH THANH TOÁN ({selectedItems.length})
                  </button>
                  
                  {selectedItems.length === 0 && (
                    <p className="text-[11px] text-center text-red-400 italic m-0">
                      * Vui lòng chọn ít nhất 1 sản phẩm để thanh toán
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}