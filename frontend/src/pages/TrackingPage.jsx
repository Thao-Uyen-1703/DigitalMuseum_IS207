import { useState } from 'react';
import { 
  Search, Package, Truck, CheckCircle, Clock, 
  Calendar, ShieldCheck, ArrowRight, Info,
  Box, NotebookPen, CheckSquare, XCircle, CreditCard
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { toast } from 'sonner';
import api from '../api/axiosClient';

export default function OrderTrackingPage() {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleString('vi-VN', { 
      timeStyle: 'short',
      dateStyle: 'short', 
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
  };

  const handleSearchSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!searchInput.trim()) {
        toast.error('Vui lòng nhập mã đơn hàng hoặc mã vận đơn!');
        return;
      }

      setLoading(true);
      setOrder(null);

      const response = await api.post(`/tracking`, { code: searchInput.trim() });
      const payload = response.data.data;
      setOrder(payload);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã đơn hàng không tồn tại hoặc có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { step: 1, label: 'Chờ xử lý', icon: Clock, desc: 'Đơn hàng đã được ghi nhận' },
    { step: 2, label: 'Đang chuẩn bị', icon: Package, desc: 'Đang đóng gói kiện hàng' },
    { step: 3, label: 'Vận chuyển', icon: Truck, desc: 'Đã giao cho đơn vị vận chuyển' },
    { step: 4, label: 'Hoàn thành', icon: CheckCircle, desc: 'Giao hàng thành công' },
  ];

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 min-h-screen py-10 md:py-16 selection:bg-[#b5995e]/20 selection:text-[#b5995e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* KHỐI TÌM KIẾM */}
          <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 text-center mb-10 max-w-3xl mx-auto transition-all">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-[#b5995e] uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Tra cứu đơn hàng
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold font-['Lora'] text-slate-800 mb-3 tracking-tight">Theo Dõi Hành Trình Đơn Hàng</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              Nhập mã định danh đơn hàng để kiểm tra tình trạng xử lý và thời gian giao hàng dự kiến.
            </p>
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nhập mã đơn hàng của bạn (VD: LCN123)..." 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#b5995e]/10 focus:border-[#b5995e] text-sm font-medium transition-all text-slate-700 placeholder:text-slate-400 shadow-inner"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#b5995e] hover:bg-[#a1844d] text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-[#b5995e]/20 active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-2 shrink-0 group"
              >
                {loading ? 'Đang truy vấn...' : 'Tra cứu ngay'}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          </div>

          {/* TRẠNG THÁI LOADING */}
          {loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-3xl mx-auto">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-[#b5995e] animate-spin"></div>
              </div>
              <p className="text-slate-500 font-medium text-sm">Đang kết nối hệ thống dữ liệu...</p>
            </div>
          )}

          {/* HIỂN THỊ KẾT QUẢ ĐƠN HÀNG */}
          {order && !loading && (
            <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-md">
                
                {/* 1. TIMELINE */}
                <div className="hidden md:grid grid-cols-4 gap-4 relative pt-2 mb-12">
                  <div className="absolute top-8 left-[12.5%] right-[12.5%] h-1 bg-slate-100 -z-0 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-[#b5995e] to-[#c7af7b] transition-all duration-700 ease-in-out rounded-full" 
                      style={{ width: `${((order.step - 1) / 3) * 100}%` }}
                    ></div>
                  </div>
                  
                  {steps.map((s) => {
                    const Icon = s.icon;
                    const isCompleted = order.step >= s.step;
                    const isCurrent = order.step === s.step;

                    return (
                      <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm ${
                          isCompleted 
                            ? 'bg-amber-50 border-[#b5995e] text-[#b5995e]' 
                            : 'bg-white border-slate-100 text-slate-300'
                        } ${isCurrent ? 'ring-4 ring-[#b5995e]/20 scale-110 bg-white' : ''}`}>
                          <Icon size={22} className={isCurrent ? 'animate-pulse' : ''} />
                        </div>
                        <h4 className={`text-sm font-bold mt-4 ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[120px]">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LUÔN HIỂN THỊ MÃ ĐƠN HÀNG VÀ TRẠNG THÁI */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5 flex items-center gap-1.5">
                      <Box size={14} /> Mã đơn hàng
                    </span>
                    <p className="font-black text-[#b5995e] text-xl tracking-wide">{order.orderCode}</p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5 flex items-center gap-1.5">
                      <NotebookPen size={14} /> Trạng thái hiện tại
                    </span>
                    <p className="font-bold text-slate-700 text-lg">{order.displayInfo.message}</p>
                  </div>

                  {/* THÔNG TIN CHO STEP 1 (Pending) VÀ STEP 2 (Processing) */}
                  {order.step <= 2 && (
                    <>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 md:col-span-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5 flex items-center gap-1.5">
                          <Calendar size={14} /> Thời gian hệ thống ghi nhận
                        </span>
                        <p className="font-semibold text-slate-700 text-base">{formatDate(order.displayInfo.date)}</p>
                      </div>
                    </>
                  )}

                  {/* THÔNG TIN CHO STEP 3 (Delivering) */}
                  {order.step === 3 && (
                    <>
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-400 uppercase block mb-1.5 flex items-center gap-1.5">
                          <Truck size={14} /> Mã vận chuyển
                        </span>
                        <p className="font-bold text-blue-700 text-base">{order.orderCode || 'Đang cập nhật...'}</p>
                      </div>

                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-400 uppercase block mb-1.5 flex items-center gap-1.5">
                          <Clock size={14} /> Thời gian bắt đầu giao
                        </span>
                        <p className="font-semibold text-blue-700 text-base">{formatDate(order.displayInfo.date)}</p>
                      </div>
                    </>
                  )}

                  {/* THÔNG TIN CHO STEP 4 (Completed) */}
                  {order.step === 4 && (
                    <>
                      <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                        <span className="text-xs font-semibold text-emerald-500 uppercase block mb-1.5 flex items-center gap-1.5">
                          <CheckSquare size={14} /> Thời gian nhận hàng
                        </span>
                        <p className="font-bold text-emerald-700 text-base">{formatDate(order.displayInfo.date)}</p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <span className="text-xs font-semibold text-slate-400 uppercase block mb-1.5 flex items-center gap-1.5">
                          <CreditCard size={14} /> Thanh toán
                        </span>
                        
                        {/* ĐÃ SỬA LẠI LOGIC THANH TOÁN (Có PaidDate = Đã thanh toán) */}
                        {!!order.displayInfo.PaidDate ? (
                          <p className="font-bold text-emerald-600 flex items-center gap-1.5 text-base">
                            <CheckCircle size={16}/> 
                            {formatMoney(order.displayInfo.amount)} <span className="text-sm font-medium text-slate-500">- Đã thanh toán</span>
                          </p>
                        ) : (
                          <p className="font-bold text-red-500 flex items-center gap-1.5 text-base">
                            <Clock size={16}/> 
                            {formatMoney(order.displayInfo.amount)} <span className="text-sm font-medium text-slate-500">- Thu tiền hộ (COD)</span>
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP CHỜ BAN ĐẦU (KHI CHƯA CÓ DỮ LIỆU) */}
          {!order && !loading && (
            <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto transition-all animate-fadeIn mt-6">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Package size={28} className="animate-bounce duration-1000" />
              </div>
              <h3 className="font-bold text-slate-700 text-lg mb-2 font-['Lora']">Hệ thống sẵn sàng tra cứu</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                Vui lòng điền mã đơn hàng vào ô trống để xem trạng thái cập nhật mới nhất.
              </p>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}