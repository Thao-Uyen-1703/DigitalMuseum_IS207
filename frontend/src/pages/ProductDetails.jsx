import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MapPin,
  ShoppingCart,
  Sparkles,
  Star,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import api from '../api/axiosClient';
import MainLayout from '../components/MainLayout';
import ProductCard from '../components/ui/ProductCard';
import ImageDisplay from '../components/ui/ImageDisplay';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [location, setLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/product/${encodeURIComponent(slug)}`);
        const payload = response.data.data;
        setProduct(payload.product);
        setLocation(payload.location);
        setReviews(payload.reviews);
        setCategory(payload.category);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error(err);
        setProduct(null);
        setError('Không tìm thấy sản phẩm hoặc đã xảy ra lỗi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ĐÃ SỬA: Đồng bộ hóa việc gom ảnh, lọc sạch URL trống, null hoặc undefined
  const productImages = useMemo(() => {
    const images = [];
    
    // 1. Lấy ảnh chính của sản phẩm
    if (product?.ImageURL && typeof product.ImageURL === 'string' && product.ImageURL.trim() !== '') {
      images.push(product.ImageURL);
    }
    
    // 2. Lấy thêm ảnh từ câu chuyện của Location (Đồng bộ với Section 2 dưới giao diện)
    if (product?.Details?.Story) {
      product.Details.Story.forEach((item) => {
        // Đồng bộ dùng chung thuộc tính ImageURL
        if (item.ImageURL && typeof item.ImageURL === 'string' && item.ImageURL.trim() !== '') {
          if (!images.includes(item.ImageURL)) {
            images.push(item.ImageURL);
          }
        }
      });
    }
    
    // Dự phòng nếu không có bất kỳ ảnh nào hợp lệ
    if (images.length === 0) {
      images.push('https://placehold.co/600x400?text=No+Image+Available');
    }
    
    return images;
  }, [product, location]);

  const { averageRating, roundedRating } = useMemo(() => {
    if (!reviews || reviews.length === 0) return { averageRating: 0, roundedRating: 0 };
    
    const total = reviews.reduce((acc, review) => acc + (review.Rating || 0), 0);
    const avg = total / reviews.length;
    
    return {
      averageRating: avg % 1 === 0 ? avg : Number(avg.toFixed(1)),
      roundedRating: Math.round(avg),
    };
  }, [reviews]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#b5995e] border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!product) return null;

  const formatPrice = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(value || 0));

  const nextImage = () => {
    if (productImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    if (productImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Hàm helper tìm kiếm index của ảnh để khi click ở danh sách dưới cùng, ảnh chính vẫn nhảy theo
  const handleThumbnailClick = (url) => {
    const targetIndex = productImages.indexOf(url);
    if (targetIndex !== -1) {
      setCurrentImageIndex(targetIndex);
      // Cuộn mượt mà lên đầu trang để xem ảnh lớn nếu cần
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToCart = async() => {
    if(!product) {
      return;
    }
    await addToCart(product, quantity, product.ImageURL);
  }

  return (
    <MainLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex flex-wrap list-none p-0 text-sm">
            <li className="after:content-['/'] after:mx-2 after:text-slate-400">
              <Link to="/" className="no-underline text-slate-500 hover:text-[#b5995e]">Bảo tàng</Link>
            </li>
            <li className="after:content-['/'] after:mx-2 after:text-slate-400">
              <span className="text-slate-500 cursor-default">{location?.LocationName}</span>
            </li>
            <li className="text-[#2c3e50] font-medium" aria-current="page">
              {product.ProductName}
            </li>
          </ol>
        </nav>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
          {/* CỘT TRÁI: KHỐI ẢNH LỚN & LIST ẢNH NHỎ */}
          <div className="lg:col-span-5 space-y-4 w-full">
            <div className="relative rounded-[15px] overflow-hidden group shadow-lg">
              <ImageDisplay 
                src={productImages[currentImageIndex]} 
                className="w-full h-[400px] sm:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute top-1/2 -translate-y-1/2 left-[10px] bg-black/30 hover:bg-[#b5995e] text-white py-4 px-3 rounded-r transition-all duration-300 z-10 font-mono"
                  >
                    &#10094;
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute top-1/2 -translate-y-1/2 right-[10px] bg-black/30 hover:bg-[#b5995e] text-white py-4 px-3 rounded-l transition-all duration-300 z-10 font-mono"
                  >
                    &#10095;
                  </button>
                </>
              )}
            </div>

            {/* List hình ảnh quảng bá sản phẩm */}
            <div className="flex gap-2 justify-center flex-wrap">
              {productImages.map((imgUrl, idx) => (
                <ImageDisplay 
                  key={`prod-img-${idx}`}
                  src={imgUrl} 
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-[80px] h-[80px] cursor-pointer object-cover rounded-lg transition-all duration-300 border-2 ${
                    idx === currentImageIndex 
                      ? 'border-[#b5995e] opacity-100 shadow-md scale-105' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: KHỐI THÔNG TIN */}
          <div className="lg:col-span-7 lg:pl-6 w-full">
            {category && (
              <span className="inline-block bg-amber-400 text-slate-800 text-[11px] font-bold px-2.5 rounded mb-3 uppercase">
                {category.CategoryName}
              </span>
            )}
            <h2 className="font-['Lora'] text-3xl sm:text-4xl font-bold mb-3 text-[#2c3e50] leading-tight">
              {product.ProductName}
            </h2>

            <div className="flex items-center mb-4 flex-wrap gap-2">
              <div className="text-amber-500 flex gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={`star-${index}`}
                    className={`h-4 w-4 transition-all duration-200 ${
                      index < roundedRating 
                        ? "fill-current text-amber-500 opacity-100" 
                        : "text-slate-300 opacity-40"
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-500 text-sm font-medium ml-1">
                {reviews.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400">|</span>
                    <span>{reviews.length} đánh giá</span>
                  </span>
                ) : (
                  <span className="text-slate-400 italic text-xs">Chưa có đánh giá nào</span>
                )}
              </span>
            </div>

            <h3 className="text-[#b5995e] text-[2.2rem] font-bold mb-4">
              {formatPrice(product.Price)}
            </h3>

            <p className="text-slate-500 text-lg mb-6 leading-relaxed">
              {product.Details?.Description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center border border-slate-300 rounded overflow-hidden h-[54px] w-[130px]">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="bg-transparent hover:bg-slate-100 text-slate-700 px-3 h-full border-r border-slate-300 font-bold transition"
                >
                  -
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-full text-center border-0 focus:ring-0 font-medium text-slate-800 bg-transparent"
                />
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="bg-transparent hover:bg-slate-100 text-slate-700 px-3 h-full border-l border-slate-300 font-bold transition"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="flex-grow bg-[#b5995e] hover:brightness-110 active:scale-[0.98] text-white text-base font-bold py-4 px-[30px] shadow transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> THÊM VÀO GIỎ
              </button>
            </div>
          </div>
        </section>

        <section id="locationSection" className="bg-white p-10 rounded-[20px] border-l-[6px] border-l-[#b5995e] mb-12 shadow-sm">
          <div className="grid md:grid-cols-12 gap-8 items-center mb-12 last:mb-0">
            <div className="md:col-span-5 md:order-2">
              <ImageDisplay
                src={location.ThumbnailURL}
                className="w-full h-[300px] object-cover rounded-[20px] shadow cursor-pointer hover:opacity-90 transition"
              />
            </div>

            <div className="md:col-span-7 md:order-1 md:pl-12">
              <h6 className="text-uppercase text-[#2a5a54] font-bold tracking-widest text-xs mb-1 uppercase">
                Khám phá nguồn gốc
              </h6>
              <h2 className="font-['Lora'] text-3xl font-bold mb-4 text-[#2c3e50]">
                {location.LocationName || ''}
              </h2>
              <div className="text-slate-500 space-y-4 leading-relaxed">
                {location.Details?.Description || ''}
              </div>
            </div>
          </div>
        </section>

        {product.Details?.Story?.length > 0 && (
          <section id="productStorySection" className="bg-white p-10 rounded-[20px] border-l-[6px] border-l-[#b5995e] mb-12 shadow-sm">
            <div className="grid md:grid-cols-12 gap-8 items-center mb-12 last:mb-0">
              <div className="md:col-span-5 md:order-1">
                <ImageDisplay
                  src={location.ThumbnailURL}
                  className="w-full h-[300px] object-cover rounded-[20px] shadow cursor-pointer hover:opacity-90 transition"
                />
              </div>

              <div className="md:col-span-7 md:order-2 md:pl-12">
                <h6 className="text-uppercase text-[#2a5a54] font-bold tracking-widest text-xs mb-1 uppercase">
                  Khám phá văn hóa
                </h6>
                <h2 className="font-['Lora'] text-3xl font-bold mb-4 text-[#2c3e50]">
                  {product.Details?.Story[0].Title}
                </h2>
                <div className="text-slate-500 space-y-4 leading-relaxed">
                  {product.Details?.Story?.[0]?.Lines?.map((line, index) => (
                    <p key={`product-story-line-${index}`}>
                      {line.Text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-slate-50 p-6 md:p-10 rounded-[20px] border border-slate-200 mb-16">
          <h4 className="font-['Lora'] text-xl font-bold mb-6 flex items-center gap-2">
            Đánh giá từ khách hàng
            {reviews.length > 0 && <span className="text-sm font-normal text-slate-500">({reviews.length})</span>}
          </h4>
          
          {reviews.length > 0 ? (
            <>
              {reviews.map((review, rIdx) => (
                <div key={review.id || review._id || `review-${rIdx}`} className="border-b border-slate-200 pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h6 className="font-bold text-[#2c3e50] m-0">{review.FullName}</h6>
                    <div className="text-amber-500 text-xs flex gap-0.5">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={`review-star-${rIdx}-${index}`}
                          className={`h-3 w-3 ${
                            index < review.Rating ? 'fill-current text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-0">
                    {review.Comment}
                  </p>
                </div>
              ))}

              <button className="bg-transparent border-0 text-[#2c3e50] font-semibold text-sm hover:underline p-0 cursor-pointer mt-2">
                Xem tất cả đánh giá
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-4">Chưa có đánh giá nào cho sản phẩm này</p>
              <button className="bg-[#b5995e] hover:bg-[#9d7e4a] text-white font-semibold py-2 px-4 rounded transition">
                Viết đánh giá
              </button>
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}