import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ClipboardList, MapPin, CreditCard, User, Phone, FileText } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useEffect } from 'react';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { order, customerInfo, finalTotal, paymentMethod } = location.state || {};

  const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  if (!location.state) return null;

  return (
    <MainLayout>
      <div className="bg-slate-50/60 min-h-screen py-12 md:py-20 flex items-center justify-center">
        <div className="max-w-3xl w-full px-4 sm:px-6">
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-10 text-center space-y-8 relative overflow-hidden">
            {/* Dải màu viền trên */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#b5995e]"></div>

            <div className="flex justify-center">
              <div className="p-4 bg-emerald-50 rounded-full text-emerald-500">
                <CheckCircle2 size={64} strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 font-['Lora']">Đặt hàng thành công!</h1>
              <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
                Cảm ơn bạn đã lựa chọn những món quà lưu niệm ý nghĩa của chúng tôi. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
              </p>
            </div>

            {/* Khối Thông tin đơn hàng */}
            <div className="bg-slate-50 rounded-2xl p-5 md:p-6 text-left border border-slate-100 space-y-4">
              <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200/60 gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Mã đơn hàng</span>
                  <p className="text-base font-bold text-slate-800 font-sans">{order}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tổng thanh toán</span>
                  <p className="text-xl font-black text-[#b5995e] font-sans">{formatPrice(finalTotal)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-1">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 m-0">
                    <User size={16} className="text-slate-400" /> Người nhận hàng
                  </h3>
                  <div className="text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800 m-0">{customerInfo?.fullName}</p>
                    <p className="flex items-center gap-1.5 m-0"><Phone size={13} /> {customerInfo?.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 m-0">
                    <MapPin size={16} className="text-slate-400" /> Địa chỉ giao hàng
                  </h3>
                  <p className="text-slate-600 leading-relaxed m-0">
                    {customerInfo?.shippingAddress?.addressDetail}, {customerInfo?.shippingAddress?.district}, {customerInfo?.shippingAddress?.province}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-3 border-t border-slate-200/60">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Phương thức thanh toán</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <CreditCard size={15} className="text-slate-400" />
                    {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua VNPAY'}
                  </span>
                </div>
                {customerInfo?.note && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Ghi chú</span>
                    <p className="text-slate-600 flex items-start gap-1.5 italic m-0"><FileText size={15} className="text-slate-400 shrink-0 mt-0.5" /> "{customerInfo.note}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#b5995e] hover:brightness-105 active:scale-[0.99] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#b5995e]/10 transition-all text-sm tracking-wide">
                <ShoppingBag size={18} /> Tiếp tục mua quà
              </Link>
              <Link to="/tra-cuu" className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold px-8 py-3.5 rounded-xl transition-all text-sm tracking-wide">
                <ClipboardList size={18} /> Tra cứu đơn hàng
              </Link>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}