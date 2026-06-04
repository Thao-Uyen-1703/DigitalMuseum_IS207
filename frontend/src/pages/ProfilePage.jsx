import { useState, useEffect } from 'react';
import { 
  User, Package, Mail, Phone, Lock, BarChart3, 
  X, Calendar, ShieldCheck, ShoppingBag, Clock, 
  Truck, CheckCircle, Edit3, ArrowUpRight, Upload
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MainLayout from '../components/MainLayout';
import ImageDisplay from '../components/ui/ImageDisplay';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [initialData, setInitialData] = useState(null);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [orders, setOrders] = useState([]);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '---';

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const userData = response.data.data || response.data;
      
      const basicData = {
        fullName: userData.FullName || '',
        email: userData.Email || '',
        phone: userData.Phone || ''
      };
      
      setFormData(basicData);
      setInitialData(basicData);
      setPreviewUrl(userData.AvatarURL || '');
    } catch (error) {
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get('/order');
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setOrdersLoading(true);
      const response = await api.get(`/order/${orderId}`);
      setOrderDetails(response.data.data || response.data);
      setIsOrderDetailsModalOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserOrders();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, image: 'Kích thước ảnh vượt quá giới hạn 25MB.' }));
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setFormErrors(prev => ({ ...prev, image: 'Chỉ chấp nhận ảnh PNG, JPG, JPEG.' }));
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: null }));
    }
  };

  const isChanged = initialData && (
    formData.fullName !== initialData.fullName ||
    formData.phone !== initialData.phone ||
    avatarFile !== null
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFormErrors({}); 

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('phone', formData.phone);
      
      if (avatarFile) {
        submitData.append('image', avatarFile); 
      }

      const response = await api.put('/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Cập nhật thông tin tài khoản thành công!');

      await refreshUser();
      
      const updatedAvatar = response.data.data.avatar;
      if (updatedAvatar) {
        setPreviewUrl(updatedAvatar);
      }

      const savedData = {
        fullName: response.data.data.fullname || '',
        email: formData.email,
        phone: response.data.data.phone || ''
      };
      
      setFormData(savedData);
      setInitialData(savedData);
      setAvatarFile(null); 
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        toast.error('Vui lòng kiểm tra lại các trường bị lỗi!');
      } else {
        toast.error(error.response?.data?.message || 'Cập nhật thất bại.');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        rePassword: passwordData.confirmPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mật khẩu cũ không chính xác.');
    }
  };

  const calculateStats = () => {
    const now = new Date();
    let monthCount = 0, monthTotal = 0, yearCount = 0, yearTotal = 0;
    orders.forEach(order => {
      const orderDate = new Date(order.OrderDate);
      const amount = Number(order.TotalAmount || 0);
      if (order.Status !== 'Cancelled' && orderDate.getFullYear() === now.getFullYear()) {
        yearCount++; yearTotal += amount;
        if (orderDate.getMonth() === now.getMonth()) { monthCount++; monthTotal += amount; }
      }
    });
    return { monthCount, monthTotal, yearCount, yearTotal };
  };
  
  const stats = calculateStats();
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={12} />
            Chờ xác nhận
          </span>
        );

      case 'Processing':
        return (
          <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200/80 rounded-full text-xs font-bold flex items-center gap-1">
            <Package size={12} />
            Đang xử lý
          </span>
        );

      case 'Delivering':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck size={12} />
            Đang giao hàng
          </span>
        );

      case 'Completed':
        return (
          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200/80 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} />
            Hoàn thành
          </span>
        );

      default:
        return (
          <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const renderAddress = (ShippingInfo) => {
    if (!ShippingInfo) return <div className="text-xs text-gray-400 mt-1">-</div>;
    const { addressDetail, district, province } = ShippingInfo;
    return `${addressDetail}, ${district}, ${province}`;
  }

  return (
    <MainLayout>
      <div className="bg-slate-50/60 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100 mb-4">
                <div 
                  onClick={() => document.getElementById('avatar-file-input').click()}
                  className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-50 shadow-sm relative group bg-slate-50 mb-3 cursor-pointer"
                >
                  {previewUrl ? (
                    previewUrl.startsWith('blob:') ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <ImageDisplay src={previewUrl} type="be" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50/50 text-[#b5995e]"><User size={36} /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={16} className="text-white" />
                  </div>
                </div>
                
                <input type="file" id="avatar-file-input" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleAvatarChange} />

                <h3 className="font-bold font-['Lora'] text-slate-800 text-base">{formData.fullName || "Thành viên Di sản"}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{formData.email}</p>
              </div>

              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-amber-50/80 text-[#b5995e]' : 'text-slate-600 hover:bg-slate-50'}`}><User size={18} /> Hồ sơ cá nhân</button>
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-amber-50/80 text-[#b5995e]' : 'text-slate-600 hover:bg-slate-50'}`}><Package size={18} /> Quản lý đơn hàng</button>
            </div>

            <div className="lg:col-span-9 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              
              {activeTab === 'profile' && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 font-['Lora']">Thông tin tài khoản</h2>
                  </div>

                  {loading ? (
                    <div className="py-10 text-center text-slate-400 text-sm">Đang tải dữ liệu hồ sơ...</div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Họ và tên</label>
                          <input 
                            required type="text" value={formData.fullName} 
                            onChange={(e) => {
                              setFormData({...formData, fullName: e.target.value});
                              if(formErrors.fullName) setFormErrors({...formErrors, fullName: null});
                            }} 
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none text-sm font-medium transition-colors ${
                              formErrors.fullName ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-[#b5995e] text-slate-700'
                            }`}
                          />
                          {formErrors.fullName && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{formErrors.fullName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">Email <Lock size={12} className="text-slate-300"/></label>
                          <input disabled type="email" value={formData.email} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"/>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Số điện thoại</label>
                          <input 
                            required type="tel" value={formData.phone} 
                            onChange={(e) => {
                              setFormData({...formData, phone: e.target.value});
                              if(formErrors.phone) setFormErrors({...formErrors, phone: null});
                            }} 
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none text-sm font-medium transition-colors ${
                              formErrors.phone ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-[#b5995e] text-slate-700'
                            }`}
                          />
                          {formErrors.phone && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{formErrors.phone}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Ảnh đại diện (Max: 25MB)</label>
                          <div 
                            onClick={() => document.getElementById('avatar-file-input').click()}
                            className={`w-full px-4 py-2.5 bg-slate-50 border border-dashed rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                              formErrors.image ? 'border-red-500 bg-red-50/30' : 'border-slate-300 hover:border-[#b5995e]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {avatarFile && previewUrl.startsWith('blob:') && (
                                <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm shrink-0 bg-white animate-fadeIn">
                                  <img src={previewUrl} className="w-full h-full object-cover" alt="Mini Preview" />
                                </div>
                              )}
                              <span className={`text-sm truncate ${avatarFile ? 'text-[#b5995e] font-semibold' : 'text-slate-400'}`}>
                                {avatarFile ? avatarFile.name : 'Nhấp để tải file ảnh lên...'}
                              </span>
                            </div>
                            <Upload size={16} className={avatarFile ? 'text-[#b5995e]' : 'text-slate-400'} />
                          </div>
                          {formErrors.image && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{formErrors.image}</p>}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="px-6 py-3.5 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                        >
                          Thay đổi mật khẩu
                        </button>

                        <button
                          type="submit"
                          disabled={!isChanged}
                          className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
                            isChanged 
                              ? 'bg-[#b5995e] hover:bg-[#a1844d] text-white shadow-[#b5995e]/30' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          {isChanged ? 'Lưu thay đổi' : 'Đã cập nhật'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 font-['Lora'] m-0">Lịch sử mua hàng</h2>
                    <button
                      type="button"
                      onClick={() => setIsStatsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <BarChart3 size={14} /> Thống kê chi tiêu
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">Đang quét dữ liệu hóa đơn...</div>
                  ) : orders.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <ShoppingBag size={40} className="text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-600 text-sm">Chưa có đơn hàng nào</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">Bạn chưa thực hiện bất kỳ giao dịch mua quà lưu niệm nào tại hệ thống di sản số.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, index) => (
                        <div key={index} className="border border-slate-100 rounded-xl p-4 md:p-5 hover:border-slate-200 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-[#b5995e]">{order.OrderTracking || `#${order.OrderID}`}</span>
                              {getStatusBadge(order.Status)}
                            </div>
                            <p className="text-xs text-slate-400">Ngày đặt hàng: <span className="font-semibold text-slate-600">{formatDate(order.OrderDate)}</span></p>
                            {order.Note && <p className="text-xs text-slate-400 truncate max-w-md">Ghi chú: {order.Note}</p>}
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-3 sm:pt-0">
                            <div className="sm:text-right">
                              <span className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider">Tổng thanh toán</span>
                              <span className="text-base font-black text-slate-800">{formatPrice(order.TotalAmount)}</span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                fetchOrderDetails(order.OrderTracking);
                              }}
                              className="p-2.5 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-[#b5995e] border border-slate-100 rounded-xl transition-all"
                            >
                              <ArrowUpRight size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
                
              {isStatsModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp border border-slate-100">
                        <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
                          <h3 className="font-bold text-base font-['Lora'] flex items-center gap-2"><BarChart3 size={18} className="text-[#b5995e]" /> Báo cáo thống kê chi tiêu</h3>
                          <button onClick={() => setIsStatsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-amber-50/40 border border-amber-100/50 p-4 rounded-xl">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Đơn trong tháng</span>
                                <span className="text-2xl font-black text-slate-800">{stats.monthCount} <span className="text-xs font-normal text-slate-400">kiện</span></span>
                                <span className="block text-xs font-bold text-[#b5995e] mt-2">{formatPrice(stats.monthTotal)}</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Đơn theo năm</span>
                                <span className="text-2xl font-black text-slate-800">{stats.yearCount} <span className="text-xs font-normal text-slate-400">kiện</span></span>
                                <span className="block text-xs font-bold text-slate-700 mt-2">{formatPrice(stats.yearTotal)}</span>
                              </div>
                          </div>

                          <p className="text-slate-400 text-[11px] text-center leading-relaxed">Dữ liệu thống kê tự động cập nhật dựa trên dòng thời gian mua hàng thực tế của tài khoản thành viên.</p>
                        </div>
                    </div>
                  </div>
              )}

              {isPasswordModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp border border-slate-100">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                          <h3 className="font-bold text-sm font-['Lora'] text-slate-800 flex items-center gap-1.5"><Lock size={16} className="text-[#b5995e]"/> Thiết lập mật khẩu mới</h3>
                          <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mật khẩu hiện tại</label>
                              <input required type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b5995e] text-sm"/>
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mật khẩu mới</label>
                              <input required type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b5995e] text-sm"/>
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Xác nhận mật khẩu mới</label>
                              <input required type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b5995e] text-sm"/>
                          </div>
                          <button
                              type="submit"
                              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm pt-3.5"
                          >
                              Cập nhật mật khẩu
                          </button>
                        </form>
                    </div>
                  </div>
              )}

              {isOrderDetailsModalOpen && orderDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-scaleUp border border-slate-100">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-base text-slate-800">Chi tiết đơn hàng <span className="font-mono font-bold text-sm text-[#b5995e]">#{orderDetails.OrderTracking}</span></h3>
                      <button onClick={() => setIsOrderDetailsModalOpen(false)}><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Thông tin người nhận */}
                      <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4 border-gray-300">
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-[10px]">Người nhận</p>
                          <p className="font-medium text-slate-700">{orderDetails.orderInfo.fullName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-[10px]">Số điện thoại</p>
                          <p className="font-medium text-slate-700">{orderDetails.orderInfo.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 font-bold uppercase text-[10px]">Địa chỉ giao hàng</p>
                          <p className="font-medium text-slate-700">{renderAddress(orderDetails.orderInfo.shippingAddress)}</p>
                        </div>
                      </div>

                      {/* Danh sách món hàng */}
                      <div className="border-t pt-4 border-gray-300">
                        <p className="text-slate-400 font-bold uppercase text-[10px] mb-3">Sản phẩm</p>
                        <div className="space-y-3">
                          {orderDetails.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2">
                              <div className="flex items-center gap-3">
                                <ImageDisplay src={item.Image} className="w-10 h-10 object-cover rounded-lg" type="fe" />
                                <p className="text-sm font-medium text-slate-700">{item.Name} <span className="text-slate-400">x{item.Quantity}</span></p>
                              </div>
                              <p className="text-sm font-bold text-slate-800">{formatPrice(item.Price * item.Quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* CẬP NHẬT: PHẦN HIỂN THỊ PHÍ VẬN CHUYỂN */}
                      <div className="border-t pt-3 mt-3 border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          Phí giao hàng {orderDetails.Shipment?.MethodName ? `(${orderDetails.Shipment.MethodName})` : ''}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {orderDetails.Shipment?.Price > 0 ? formatPrice(orderDetails.Shipment.Price) : 'Miễn phí'}
                        </span>
                      </div>

                      <div className="border-t pt-4 mt-3 border-gray-300 flex justify-between items-center">
                        <span className="font-bold text-slate-800">Tổng thanh toán:</span>
                        <span className="text-lg font-black text-[#b5995e]">{formatPrice(orderDetails.TotalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}