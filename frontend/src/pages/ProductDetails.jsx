import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MapPin,
  ShoppingCart,
  Star,
  Archive,
  ArchiveX,
  BookOpen
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import api from '../api/axiosClient';
import MainLayout from '../components/MainLayout';
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
        
        // Cập nhật số lượng mặc định dựa trên tồn kho
        if (payload.product?.Stock === 0) {
          setQuantity(0);
        } else {
          setQuantity(1);
        }

      } catch (err) {
        setProduct(null);
        setError('Không tìm thấy sản phẩm hoặc đã xảy ra lỗi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const productImages = useMemo(() => {
    const images = [];
    
    if (product?.ImageURL && typeof product.ImageURL === 'string' && product.ImageURL.trim() !== '') {
      images.push(product.ImageURL);
    }
    
    if (product?.Details?.Story) {
      product.Details.Story.forEach((item) => {
        if (item.ImageURL && typeof item.ImageURL === 'string' && item.ImageURL.trim() !== '') {
          if (!images.includes(item.ImageURL)) {
            images.push(item.ImageURL);
          }
        }
      });
    }
    
    if (images.length === 0) {
      images.push('https://placehold.co/600x400?text=No+Image+Available');
    }
    
    return images;
  }, [product]);

  const { roundedRating } = useMemo(() => {
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
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#b5995e] border-t-transparent shadow-md"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <ArchiveX className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Không tìm thấy dữ liệu</h2>
          <p className="text-slate-500 mb-6">{error || 'Sản phẩm này không tồn tại hoặc đã bị gỡ bỏ.'}</p>
          <Link to="/" className="text-[#b5995e] hover:underline flex items-center gap-2 font-medium">
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>
      </MainLayout>
    );
  }

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

  const handleAddToCart = async () => {
    if (!product || product.Stock === 0) return;
    await addToCart(product, quantity, product.ImageURL);
  };

  const availableStock = product.Stock || 0;
  const isOutOfStock = availableStock === 0;

  return (
    <MainLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8 bg-slate-50 py-3 px-5 rounded-xl inline-block border border-slate-100">
          <ol className="flex flex-wrap items-center list-none p-0 text-sm font-medium">
            <li className="flex items-center">
              <Link to="/" className="text-slate-500 hover:text-[#b5995e] transition-colors">Cửa hàng</Link>
              <span className="mx-3 text-slate-300">/</span>
            </li>
            {location && (
              <li className="flex items-center">
                <span className="text-slate-500">{location.LocationName}</span>
                <span className="mx-3 text-slate-300">/</span>
              </li>
            )}
            <li className="text-[#b5995e]" aria-current="page">
              {product.ProductName}
            </li>
          </ol>
        </nav>

        {/* THÔNG TIN SẢN PHẨM CHÍNH */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20 items-start">
          
          {/* CỘT TRÁI: Gallery Ảnh */}
          <div className="lg:col-span-5 space-y-4 w-full sticky top-24">
            <div className="relative rounded-2xl overflow-hidden group shadow-sm border border-slate-100 bg-white">
              <ImageDisplay 
                src={productImages[currentImageIndex]} 
                className="w-full h-[400px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
              />
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute top-1/2 -translate-y-1/2 left-3 bg-white/80 hover:bg-[#b5995e] text-slate-800 hover:text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute top-1/2 -translate-y-1/2 right-3 bg-white/80 hover:bg-[#b5995e] text-slate-800 hover:text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                  >
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* List hình ảnh nhỏ */}
            {productImages.length > 1 && (
              <div className="flex gap-3 justify-center flex-wrap pt-2">
                {productImages.map((imgUrl, idx) => (
                  <button
                    key={`prod-img-${idx}`}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden w-20 h-20 transition-all duration-300 border-2 ${
                      idx === currentImageIndex 
                        ? 'border-[#b5995e] shadow-md scale-105' 
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <ImageDisplay src={imgUrl} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Thông tin & Đặt hàng */}
          <div className="lg:col-span-7 w-full flex flex-col h-full">
            <div>
              {category && (
                <span className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg mb-4 uppercase tracking-wider border border-amber-100">
                  {category.CategoryName}
                </span>
              )}
              
              <h1 className="font-['Lora'] text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-slate-800 leading-tight">
                {product.ProductName}
              </h1>

              <div className="flex items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <div className="flex gap-0.5 mr-2">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={`star-${index}`}
                        className={`h-4 w-4 ${
                          index < roundedRating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    {reviews.length > 0 ? `${reviews.length} Đánh giá` : 'Chưa có đánh giá'}
                  </span>
                </div>

                {/* Badge Tồn kho */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold ${isOutOfStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {isOutOfStock ? <ArchiveX size={16} /> : <Archive size={16} />}
                  {isOutOfStock ? 'Tạm thời hết hàng' : `Còn lại: ${availableStock} sản phẩm`}
                </div>
              </div>

              <div className="mb-8">
                <span className="text-[#b5995e] text-4xl font-black tracking-tight">
                  {formatPrice(product.Price)}
                </span>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed mb-10">
                <p>{product.Details?.Description}</p>
              </div>
            </div>

            {/* Khu vực Chọn số lượng & Mua hàng */}
            <div className="mt-auto bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                
                {/* Bộ đếm số lượng */}
                <div className={`flex items-center border rounded-xl overflow-hidden h-14 bg-white sm:w-[140px] shrink-0 ${isOutOfStock ? 'border-slate-200 opacity-50' : 'border-slate-300 focus-within:border-[#b5995e] focus-within:ring-1 focus-within:ring-[#b5995e]'}`}>
                  <button
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <span className="text-xl font-medium leading-none">-</span>
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={quantity}
                    className="w-full text-center border-0 focus:ring-0 font-bold text-slate-800 bg-transparent p-0"
                  />
                  <button
                    disabled={isOutOfStock || quantity >= availableStock}
                    onClick={() => setQuantity(prev => Math.min(availableStock, prev + 1))}
                    className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <span className="text-xl font-medium leading-none">+</span>
                  </button>
                </div>

                {/* Nút Thêm vào giỏ */}
                <button 
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-grow h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-base transition-all duration-300 shadow-sm ${
                    isOutOfStock 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none' 
                      : 'bg-[#b5995e] hover:bg-[#a38850] active:scale-[0.98] text-white hover:shadow-md hover:shadow-[#b5995e]/20'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" /> 
                  {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ'}
                </button>
              </div>
              
              {!isOutOfStock && quantity >= availableStock && (
                 <p className="text-amber-600 text-xs mt-3 font-medium flex items-center gap-1.5 animate-in fade-in">
                   <Star size={12} className="fill-current"/> Bạn đã chọn số lượng tối đa có thể mua.
                 </p>
              )}
            </div>
          </div>
        </section>

        {/* SECTION NGUỒN GỐC VĂN HÓA (LOCATION) */}
        {location && (
          <section className="mb-16">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-2 items-center">
                <div className="h-[300px] md:h-full relative overflow-hidden group">
                  <ImageDisplay
                    src={location.ThumbnailURL}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden"></div>
                </div>
                <div className="p-8 md:p-12 lg:p-16">
                  <div className="flex items-center gap-2 text-[#b5995e] font-bold text-xs uppercase tracking-widest mb-3">
                    <MapPin size={16} /> Nơi khởi nguồn
                  </div>
                  <h2 className="font-['Lora'] text-3xl sm:text-4xl font-bold mb-6 text-slate-800 leading-tight">
                    {location.LocationName}
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {location.Details?.Description}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION CÂU CHUYỆN SẢN PHẨM (STORY) */}
        {product.Details?.Story?.length > 0 && (
          <section className="mb-20 space-y-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-full mb-4 text-[#b5995e]">
                <BookOpen size={24} />
              </div>
              <h2 className="font-['Lora'] text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Câu chuyện văn hóa</h2>
              <p className="text-slate-500">Mỗi sản phẩm là một tác phẩm nghệ thuật mang trong mình dòng chảy lịch sử và kỹ hoa thủ công truyền thống.</p>
            </div>

            {product.Details.Story.map((storyItem, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={`story-${index}`} className="grid md:grid-cols-12 gap-8 lg:gap-16 items-center">
                  <div className={`md:col-span-6 rounded-3xl overflow-hidden shadow-lg border border-slate-100 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                    <ImageDisplay
                      src={storyItem.ImageURL || product.ImageURL}
                      className="w-full h-[350px] object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className={`md:col-span-6 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    <h3 className="font-['Lora'] text-2xl font-bold mb-6 text-slate-800 relative inline-block">
                      {storyItem.Title}
                      <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-[#b5995e] rounded-full"></span>
                    </h3>
                    <div className="space-y-4 text-slate-600 leading-relaxed">
                      {storyItem.Lines?.map((line, lIdx) => (
                        <p key={`story-line-${index}-${lIdx}`}>{line.Text}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* SECTION ĐÁNH GIÁ (REVIEWS) */}
        <section className="bg-slate-50/80 p-8 md:p-12 rounded-3xl border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="font-['Lora'] text-2xl font-bold text-slate-800 mb-2">Đánh giá từ khách hàng</h2>
              <p className="text-slate-500 text-sm">Những chia sẻ chân thực từ người dùng về {product.ProductName}</p>
            </div>
            {reviews.length > 0 && (
              <div className="flex flex-col items-end">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={`avg-star-${i}`} className={`w-5 h-5 ${i < roundedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <span className="font-bold text-slate-800 text-lg">{roundedRating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>
          
          {reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, rIdx) => (
                  <div key={`review-${rIdx}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                          {review.FullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h6 className="font-bold text-slate-800 text-sm m-0">{review.FullName}</h6>
                          <span className="text-xs text-slate-400">{review.ReviewDate ? new Date(review.ReviewDate).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, index) => (
                        <Star key={`rev-star-${index}`} className={`h-3 w-3 ${index < review.Rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-0">
                      "{review.Comment}"
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button className="text-[#b5995e] font-semibold text-sm hover:text-[#9d7e4a] transition-colors border-b-2 border-transparent hover:border-[#9d7e4a] pb-1">
                  Xem thêm đánh giá
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-slate-100 border-dashed text-center">
              <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium mb-4">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}