import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Truck, CreditCard, 
  User, FileText
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useCart } from '../context/CartContext';
import api from '../api/axiosClient';
import { toast } from 'sonner';
import ImageDisplay from '../components/ui/ImageDisplay';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { removeFromCart } = useCart(); 

  // 1. STATE DỮ LIỆU ĐƠN HÀNG VÀ VẬN CHUYỂN
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [displayTotal, setDisplayTotal] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [methods, setMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  // --- STATE MỚI CHO API ĐỊA CHỈ ---
  const [locations, setLocations] = useState([]); // Chứa toàn bộ Tỉnh & Quận
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');

  // 2. STATE FORM NHẬP LIỆU 
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: '',      
    district: '',      
    addressDetail: '', 
    orderNote: '',     
    paymentMethod: 'COD' 
  });

  const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  useEffect(() => {
    const itemsFromCart = location.state?.checkoutItems;
    const subtotalFromCart = location.state?.subtotal;
    
    if (!itemsFromCart || itemsFromCart.length === 0) {
      toast.error('Vui lòng chọn sản phẩm quà lưu niệm trước khi thanh toán');
      navigate('/gio-hang', { replace: true });
      return;
    }

    setCheckoutItems(itemsFromCart);
    setDisplayTotal(subtotalFromCart || 0);

    const fetchShippingMethods = async () => {
      try {
        const response = await api.get('/shipment-methods'); 
        const data = response.data.data || response.data; 
        setMethods(data);
        
        if (data && data.length > 0) {
          setSelectedShipping(data[0]);
        }
      } catch (error) {
        console.error("Lỗi fetch phương thức vận chuyển:", error);
        toast.error("Không thể tải phương thức vận chuyển.");
      }
    };

    // Gọi API Tỉnh thành phố (depth=2: lấy cả Thành phố và Quận/huyện)
    const fetchLocations = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=2');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Lỗi fetch địa điểm:", error);
        toast.error("Không thể tải danh sách Tỉnh/Thành phố.");
      }
    };

    fetchShippingMethods();
    fetchLocations();
  }, [location, navigate]);

  // XỬ LÝ ĐẶT HÀNG
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = checkoutItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const payload = {
        items: orderPayload,
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          shippingAddress: {
            province: formData.province,
            district: formData.district,
            addressDetail: formData.addressDetail
          },
          note: formData.orderNote
        },
        paymentMethod: formData.paymentMethod,
        shippingMethodId: selectedShipping?.ShippingMethodID
      };

      const response = await api.post('/checkout', payload);

      const orderData = response.data?.data || response.data;

      const purchasedIds = checkoutItems.map(item => item.productId);
      removeFromCart(purchasedIds);

      toast.success('Đặt hàng thành công!');

      navigate('/dat-hang-thanh-cong', { 
        state: { 
          order: orderData, 
          customerInfo: payload.customerInfo, 
          finalTotal: finalTotal,
          paymentMethod: formData.paymentMethod
        } 
      });

    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // XỬ LÝ KHI CHỌN TỈNH/THÀNH PHỐ
  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedProvinceCode(code);
    setSelectedDistrictCode(''); // Reset quận/huyện khi đổi tỉnh
    setFormData({ 
      ...formData, 
      province: code ? name : '', 
      district: '' // Xóa dữ liệu quận/huyện cũ trong formData
    });
  };

  // XỬ LÝ KHI CHỌN QUẬN/HUYỆN
  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedDistrictCode(code);
    setFormData({ 
      ...formData, 
      district: code ? name : '' 
    });
  };

  if (checkoutItems.length === 0) return null; 

  const finalTotal = displayTotal + (selectedShipping ? Number(selectedShipping.Price || 0) : 0);

  // Lọc ra danh sách Quận/Huyện dựa trên Tỉnh/Thành phố đang chọn
  const currentProvince = locations.find(p => p.code.toString() === selectedProvinceCode);
  const availableDistricts = currentProvince ? currentProvince.districts : [];

  return (
    <MainLayout>
      <div className="bg-slate-50/60 min-h-screen py-8 md:py-12">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link to="/gio-hang" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#b5995e] mb-6 md:mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại giỏ hàng
          </Link>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CỘT TRÁI */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-[#b5995e]"><User size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800 font-['Lora']">Thông tin cá nhân</h2>
                </div>

                <div className="space-y-4">                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Họ và tên người nhận <span className="text-red-500">*</span></label>
                      <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b5995e]/20 focus:border-[#b5995e] transition-all text-sm" placeholder="Ví dụ: Nguyễn Văn A"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b5995e]/20 focus:border-[#b5995e] transition-all text-sm" placeholder="09xxxxxxxx"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* BẢN SỬA: ĐỊA CHỈ GIAO HÀNG */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-[#b5995e]"><MapPin size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800 font-['Lora']">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select Tỉnh / Thành phố */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        value={selectedProvinceCode} 
                        onChange={handleProvinceChange} 
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b5995e]/20 focus:border-[#b5995e] transition-all text-sm cursor-pointer"
                      >
                        <option value="">-- Chọn Tỉnh / Thành phố --</option>
                        {locations.map(province => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Quận / Huyện */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Quận / Huyện <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        value={selectedDistrictCode} 
                        onChange={handleDistrictChange} 
                        disabled={!selectedProvinceCode}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b5995e]/20 focus:border-[#b5995e] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 cursor-pointer"
                      >
                        <option value="">-- Chọn Quận / Huyện --</option>
                        {availableDistricts.map(district => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                    <input required type="text" name="addressDetail" value={formData.addressDetail} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b5995e]/20 focus:border-[#b5995e] transition-all text-sm" placeholder="Số nhà, ngõ ngách, tên đường..."/>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                      <FileText size={14} /> Ghi chú giao hàng (Tùy chọn)
                    </label>
                    <textarea rows="2" name="orderNote" value={formData.orderNote} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b5995e]/20 focus:border-[#b5995e] transition-all text-sm resize-none" placeholder="Lưu ý cho người giao quà..."></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-[#b5995e]"><CreditCard size={20} /></div>
                  <h2 className="text-xl font-bold text-slate-800 font-['Lora']">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-[#b5995e] bg-amber-50/10 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="text-[#b5995e] focus:ring-[#b5995e] mt-1"/>
                    <div className="ml-3">
                      <span className="block font-semibold text-slate-800 text-sm">Thanh toán khi nhận hàng (COD)</span>
                      <span className="block text-xs text-slate-400 mt-0.5">Kiểm tra quà lưu niệm trước khi gửi tiền</span>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border rounded-xl transition-all opacity-50 cursor-not-allowed ${formData.paymentMethod === 'VNPAY' ? 'border-[#b5995e] bg-amber-50/10 shadow-sm' : 'border-slate-100'}`}>
                    <input type="radio" name="paymentMethod" value="VNPAY" disabled checked={formData.paymentMethod === 'VNPAY'} onChange={handleChange} className="text-[#b5995e] focus:ring-[#b5995e] mt-1"/>
                    <div className="ml-3">
                      <span className="block font-semibold text-slate-800 text-sm">Thanh toán trực tuyến VNPAY</span>
                      <span className="block text-xs text-slate-400 mt-0.5">Hỗ trợ quét mã QR, thẻ ATM</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* CỘT PHẢI */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 m-0 font-['Lora']">Hóa đơn hàng</h2>
              
              <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin">
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="flex gap-4 items-center justify-between group">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                        <ImageDisplay src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-700 truncate mb-0.5">{item.productName}</h4>
                        <p className="text-xs text-slate-400 font-medium">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-800 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2 border-t border-dashed border-slate-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hình thức vận chuyển *
                </label>
                <div className="space-y-2">
                  {methods.map((method, index) => {
                    const isSelected = selectedShipping?.MethodName === method.MethodName;

                    return (
                      <label
                        key={index}
                        className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#b5995e] bg-amber-50/10 shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                        }`}
                        onClick={() => setSelectedShipping(method)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="radio"
                            name="shippingMethodSelection"
                            checked={isSelected}
                            onChange={() => setSelectedShipping(method)}
                            className="text-[#b5995e] focus:ring-[#b5995e] h-4 w-4 border-slate-300"
                          />
                          <span className="text-sm font-semibold text-slate-700 truncate">
                            {method.MethodName}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 shrink-0">
                          {Number(method.Price) === 0 ? (
                            <span className="text-green-600 font-semibold text-xs uppercase bg-green-50 px-2 py-0.5 rounded-full">Miễn phí</span>
                          ) : (
                            formatPrice(method.Price)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">Tổng tiền thanh toán:</span>
                <span className="text-[#b5995e] text-2xl font-black font-sans tracking-tight">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#b5995e] hover:brightness-105 active:scale-[0.99] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#b5995e]/10 transition-all text-base tracking-wide disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'ĐANG KHỞI TẠO ĐƠN HÀNG...' : `XÁC NHẬN ĐẶT MUA`}
              </button>
            </div>

          </form>
        </main>
      </div>
    </MainLayout>
  );
}