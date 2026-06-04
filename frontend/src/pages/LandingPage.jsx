import MainLayout from '../components/MainLayout';
import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, ArrowRight, Landmark, ShoppingBag, ShieldCheck, Gem } from 'lucide-react';
import BannerImage from '../assets/banner.jpg';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import ImageDisplay from '../components/ui/ImageDisplay';

const highlights = [];

export default function LandingPage() {
  const [landingProducts, setLandingProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLandingProducts = async () => {
      try {
        const response = await api.get('/product/landing?limit=5');
        if (response.data && response.data.success) {
          setLandingProducts(response.data.data || []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm landing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingProducts();
  }, []);

  useEffect(() => {
    if (!landingProducts.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % landingProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [landingProducts]);

  const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const currentProduct = landingProducts[currentSlide] || {};
  const landingCards = landingProducts.slice(0, 4);

  return (
    <MainLayout>
      <div className="landing-page bg-slate-50 text-slate-800 selection:bg-[#b5995e]/20 selection:text-[#b5995e]">
        
        {/* --- SECTION 1: HERO (Giữ lại nét hoành tráng nhưng làm sáng hơn) --- */}
        <section className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-slate-900">
            <img 
              src={BannerImage} 
              alt="Di sản Việt" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_ease-in-out_infinite]" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fadeIn">
              <Sparkles size={14} /> Khám phá tinh hoa Việt
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-['Lora'] text-white leading-tight mb-6">
              Chạm vào <span className="text-[#b5995e]">Di Sản</span> <br /> 
              Giữ lấy <span className="italic font-light">Ký Ức Thời Gian</span>
            </h1>
            <p className="max-w-2xl text-base md:text-lg text-slate-300 mb-10 leading-relaxed font-light">
              Chúng tôi không chỉ trưng bày hiện vật — chúng tôi thổi hồn vào lịch sử. Khám phá và sở hữu những tác phẩm thủ công truyền thống mang đậm bản sắc văn hóa Việt Nam trong không gian sống của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cua-hang" className="px-8 py-4 bg-[#b5995e] hover:bg-[#a1844d] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#b5995e]/30 flex items-center justify-center gap-2 group">
                Khám phá cửa hàng <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: BẢO TÀNG SỐ VÀ SẢN PHẨM NỔI BẬT --- */}
        <section className="py-20 md:py-28 relative overflow-hidden bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Cột trái: Slider Sản phẩm nổi bật */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-amber-50 rounded-3xl transform rotate-3 scale-105" />
              <div className="relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col h-full group">
                <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center p-8 overflow-hidden">
                  {isLoading ? (
                    <div className="text-slate-500">Đang tải sản phẩm...</div>
                  ) : landingProducts.length ? (
                    <ImageDisplay
                      src={currentProduct.ImageURL || BannerImage}
                      alt={currentProduct.ProductName || 'Sản phẩm nổi bật'}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-slate-500">Không có sản phẩm để hiển thị</div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-bold text-[#b5995e]">{formatPrice(currentProduct.Price)}</span>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[#b5995e] text-xs font-bold mb-2 uppercase tracking-widest">{currentProduct.ProductName ? 'Sản phẩm nổi bật' : 'Sản phẩm đang cập nhật'}</p>
                  <h3 className="text-2xl font-bold font-['Lora'] text-slate-800 mb-3">{currentProduct.ProductName || 'Sản phẩm đang cập nhật'}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">{currentProduct.Description || currentProduct.CulturalStory || 'Khám phá các sản phẩm thủ công chất lượng với giá trị văn hóa đặc sắc.'}</p>
                  <Link
                    to={currentProduct.SlugName ? `/san-pham/${currentProduct.SlugName}` : '/cua-hang'}
                    className="text-slate-800 font-bold text-sm flex items-center gap-2 hover:text-[#b5995e] transition-colors"
                  >
                    Xem chi tiết sản phẩm <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              
              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {landingProducts.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#b5995e]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Cột phải: Giá trị cốt lõi */}
            <div className="order-1 lg:order-2 space-y-10">
              <div>
                <span className="text-[#b5995e] font-bold tracking-widest text-sm uppercase mb-2 block">Giá trị cốt lõi</span>
                <h2 className="text-3xl md:text-5xl font-bold font-['Lora'] leading-tight text-slate-800">
                  Mỗi hiện vật là một <br/><span className="text-[#b5995e] italic">cuộc hội thoại</span>
                </h2>
              </div>
              <div className="space-y-8">
                {[
                  { icon: BookOpen, title: "Lưu giữ nguyên bản", desc: "Tái hiện trọn vẹn câu chuyện lịch sử, văn hóa đằng sau mỗi vật phẩm, để di sản không chỉ được xem mà còn được hiểu sâu sắc." },
                  { icon: Gem, title: "Chế tác tinh xảo", desc: "Tôn vinh bàn tay tài hoa của các nghệ nhân truyền thống thông qua các sản phẩm thủ công chất lượng cao." },
                  { icon: ShieldCheck, title: "Bảo chứng chất lượng", desc: "Mọi tác phẩm đều được kiểm định nguồn gốc rõ ràng, mang lại sự an tâm tuyệt đối cho không gian sống của bạn." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="shrink-0 w-12 h-12 bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b5995e] rounded-xl shadow-sm">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: BỘ SƯU TẬP NỔI BẬT --- */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl">
                <span className="text-[#b5995e] font-bold uppercase tracking-widest text-xs mb-2 block">Bộ sưu tập giới hạn</span>
                <h2 className="text-3xl md:text-5xl font-bold font-['Lora'] text-slate-800">Mang báu vật văn hóa <br/>về không gian sống</h2>
              </div>
              <Link to="/cua-hang" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:text-[#b5995e] hover:border-[#b5995e] hover:shadow-md font-semibold rounded-xl transition-all text-sm">
                Xem toàn bộ cửa hàng
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {isLoading ? (
                <div className="col-span-full text-center text-slate-500">Đang tải sản phẩm...</div>
              ) : landingCards.length ? (
                landingCards.map((item) => (
                  <div key={item.ProductID} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 group flex flex-col h-full">
                    <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                      <ImageDisplay
                        src={item.ImageURL || BannerImage}
                        alt={item.ProductName}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                        <Link to={item.SlugName ? `/san-pham/${item.SlugName}` : '/cua-hang'} className="w-full bg-[#b5995e] text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
                          <ShoppingBag size={16} /> Mua ngay
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow">
                      <p className="text-xs text-slate-400 mb-1">{item.CategoryID ? `Danh mục #${item.CategoryID}` : 'Sản phẩm nổi bật'}</p>
                      <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-[#b5995e] transition-colors line-clamp-2">{item.ProductName}</h3>
                      <div className="mt-auto">
                        <span className="text-lg font-black text-[#b5995e]">{formatPrice(item.Price)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-slate-500">Không có sản phẩm để hiển thị.</div>
              )}
            </div>
          </div>
        </section>

        {/* --- SECTION 4: CTA --- */}
        <section className="py-12 px-6 relative overflow-hidden bg-white border-t border-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark size={32} className="text-[#b5995e]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-['Lora'] mb-6 text-slate-800 leading-tight">
              Di sản Việt Nam <br/> nằm trong tay bạn
            </h2>
            <p className="text-slate-500 mb-10">Đăng ký nhận bản tin để trở thành người đầu tiên biết về các bộ sưu tập văn hóa mới và nhận ưu đãi độc quyền.</p>
        
            <Link
              to="/dang-nhap"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md shrink-0 inline-flex items-center justify-center"
            >
              Đăng ký ngay
            </Link>
          </div>
        </section>
        
      </div>
    </MainLayout>
  );
}