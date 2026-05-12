import MainLayout from '../components/MainLayout';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, ScrollText, Sparkles, ArrowRight, Landmark, ShoppingBag, History } from 'lucide-react';
import BannerImage from '../assets/banner.jpg';
import AoDaiImage from '../assets/aodai.png';
import NonLaImage from '../assets/nonla.png';
import ThuYenImage from '../assets/thuyen.png';
import CauRongImage from '../assets/caurong.png';
import DenLongImage from '../assets/denlong.png';
import TranhBienImage from '../assets/tranhbien.png';

const storyChapters = [
  {
    id: 1,
    image: AoDaiImage,
    title: 'Áo Dài',
    desc: 'Trang phục truyền thống của Việt Nam',
    beat: 'Chương I — Dáng hình',
  },
  {
    id: 2,
    image: NonLaImage,
    title: 'Nón Lá',
    desc: 'Biểu tượng của văn hóa Việt',
    beat: 'Chương II — Che nắng che mưa',
  },
  {
    id: 3,
    image: ThuYenImage,
    title: 'Thuyền',
    desc: 'Công cụ đánh cá truyền thống',
    beat: 'Chương III — Sông và biển',
  },
  {
    id: 4,
    image: CauRongImage,
    title: 'Cầu Rồng',
    desc: 'Kiến trúc biểu tượng Đà Nẵng',
    beat: 'Chương IV — Cầu nối ký ức',
  },
  {
    id: 5,
    image: DenLongImage,
    title: 'Đèn Lồng',
    desc: 'Đèn lồng truyền thống Việt',
    beat: 'Chương V — Ánh sáng phố cổ',
  },
  {
    id: 6,
    image: TranhBienImage,
    title: 'Tranh Biển',
    desc: 'Nghệ thuật vẽ truyền thống',
    beat: 'Chương VI — Nét vẽ thời gian',
  },
];

const narrativePillars = [
  {
    Icon: BookOpen,
    title: 'Khởi nguồn',
    body: 'Mỗi hiện vật là một đoạn thoại giữa quá khứ và hiện tại — chúng tôi bắt đầu từ câu chuyện, không phải từ danh mục.',
  },
  {
    Icon: ScrollText,
    title: 'Lưu trữ số',
    body: 'Bảo tàng số giữ nguyên chi tiết, ngữ cảnh và cảm xúc: để di sản không chỉ được xem, mà được hiểu theo trình tự.',
  },
  {
    Icon: Sparkles,
    title: 'Chia sẻ',
    body: 'Khi câu chuyện được kể lại, nó sống. Lacani kết nối cộng đồng với những lớp nghĩa văn hóa Việt.',
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % storyChapters.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % storyChapters.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + storyChapters.length) % storyChapters.length);

return (
    <MainLayout>
      <div className="landing-page bg-[#0a0a0a] text-gray-100 selection:bg-amber-500/30">
        
        {/* --- SECTION 1: THE PORTAL (HERO) --- */}
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <img 
            src={BannerImage} 
            alt="Di sản Việt" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 animate-[pulse_8s_ease-in-out_infinite]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
          
          <div className="relative max-w-7xl mx-auto px-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-8 animate-bounce">
              <Sparkles size={14} /> Khám phá di sản số
            </div>
            <h1 className="text-5xl md:text-8xl font-bold font-playfair leading-[1.1] mb-8">
              Chạm vào <span className="text-amber-500">Di Sản</span> <br /> 
              Giữ lấy <span className="italic text-gray-400 font-light text-4xl md:text-6xl">Ký Ức Việt</span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
              Lacani không chỉ trưng bày — chúng tôi thổi hồn vào hiện vật qua công nghệ số, giúp bạn sở hữu những mảnh ghép tinh hoa của lịch sử trong không gian hiện đại.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="px-10 py-5 bg-amber-500 text-black font-black uppercase tracking-tighter hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3">
                Vào Bảo Tàng
              </button>
              <button className="px-10 py-5 border border-white/20 hover:border-amber-500 transition-all backdrop-blur-md flex items-center justify-center gap-3 group">
                Cửa hàng di sản <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: THE MUSEUM EXPERIENCE (Bảo tàng) --- */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-amber-500/10 blur-3xl rounded-full" />
              <div className="relative aspect-[4/5] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden group">
                <img 
                  src={storyChapters[currentSlide].image} 
                  alt="Feature" 
                  className="w-full h-full object-contain p-12 transition-all duration-700 group-hover:scale-110" 
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                  <p className="text-amber-500 text-sm font-bold mb-2 uppercase tracking-widest">{storyChapters[currentSlide].beat}</p>
                  <h3 className="text-3xl font-bold font-playfair">{storyChapters[currentSlide].title}</h3>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-10">
              <h2 className="text-4xl md:text-5xl font-bold font-playfair leading-tight">
                Mỗi hiện vật là một <br/><span className="text-amber-500">cuộc hội thoại</span>
              </h2>
              <div className="space-y-8">
                {[
                  { icon: History, title: "Ngữ cảnh nguyên bản", desc: "Chúng tôi tái hiện câu chuyện lịch sử đằng sau mỗi vật phẩm bằng công nghệ kể chuyện số." },
                  { icon: Sparkles, title: "Chi tiết tinh xảo", desc: "Khám phá từng đường nét thủ công ở độ phân giải siêu thực, điều mà mắt thường khó nhận thấy." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="shrink-0 w-14 h-14 bg-gray-900 border border-amber-500/30 flex items-center justify-center text-amber-500 rounded-xl">
                      <item.icon size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-amber-500 font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm tracking-widest pt-4">
                Tìm hiểu thêm về di sản <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: CURATED BOUTIQUE (Thương mại) --- */}
        <section className="py-24 bg-white text-[#0a0a0a] rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <p className="text-amber-600 font-bold uppercase tracking-widest text-sm mb-3">Thương mại di sản</p>
                <h2 className="text-4xl md:text-6xl font-bold font-playfair leading-none">Mang báu vật <br/>về không gian sống</h2>
              </div>
              <button className="px-8 py-4 bg-black text-white font-bold hover:bg-amber-600 transition-colors">
                Xem toàn bộ cửa hàng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {storyChapters.slice(0, 3).map((item) => (
                <div key={item.id} className="group">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden mb-6 border border-gray-100 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-2/3 h-2/3 object-contain transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <button className="absolute bottom-0 left-0 right-0 bg-black text-white py-4 font-bold flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <ShoppingBag size={18} /> THÊM VÀO GIỎ
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold font-playfair mb-1 group-hover:text-amber-600 transition-colors">{item.title}</h3>
                      <p className="text-gray-500 text-sm italic">Bản phục dựng thủ công giới hạn</p>
                    </div>
                    <span className="text-xl font-bold text-amber-700">950.000đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 4: THE CALL (CTA) --- */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <Landmark size={64} className="mx-auto text-amber-500 mb-8" />
            <h2 className="text-4xl md:text-7xl font-bold font-playfair mb-10 leading-tight">
              Di sản Việt Nam <br/> nằm trong tay <span className="italic text-amber-500">chính bạn</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <input 
                type="email" 
                placeholder="Để lại email để nhận đặc quyền di sản..." 
                className="bg-white/5 border border-white/10 px-8 py-5 rounded-sm focus:outline-none focus:border-amber-500 md:w-96"
              />
              <button className="px-10 py-5 bg-amber-500 text-black font-black uppercase hover:bg-amber-400 transition-all">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}