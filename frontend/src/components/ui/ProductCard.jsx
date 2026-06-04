import { ShoppingCart, MapPin, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageDisplay from './ImageDisplay';

export default function ProductCard({ product, locationList = [] }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseFloat(price));
  };

  // Map OriginLocationID ra LocationName
  const location = locationList.find(loc => loc.LocationID === product.OriginLocationID);
  const locationName = location ? location.LocationName : 'Sản phẩm Việt Nam';

  // Kiểm tra hết hàng
  const isOutOfStock = product.Stock === 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ảnh sản phẩm */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <ImageDisplay
          src={product.ImageURL}
          alt={product.ProductName}
          type="be"
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''}`}
        />
        {/* Badge Trạng thái kho */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
              Hết hàng
            </span>
          ) : (
            <span className="bg-green-500/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
              Còn hàng
            </span>
          )}
        </div>
      </div>

      {/* Nội dung sản phẩm */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Tên sản phẩm */}
        <h3 className="font-bold text-base text-gray-800 mb-1.5 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {product.ProductName}
        </h3>

        {/* Vị trí xuất xứ */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{locationName}</span>
        </div>

        {/* Giá tiền */}
        <div className="mb-4">
          <span className="text-lg font-black text-amber-600">
            {formatPrice(product.Price || 0)}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-xs text-amber-700 italic mt-2 line-clamp-1">
            ✨ {product.CulturalStory}
          </p>
        </div>

        {/* Khoảng trống đẩy nút xuống đáy */}
        <div className="flex-grow"></div>

        {/* Nút hành động CĂN GIỮA - LUÔN CHO PHÉP CLICK */}
        <div className="w-full flex justify-center mt-2 pt-3 border-t border-gray-50">
          <Link
            to={`/san-pham/${product.SlugName || ''}`}
            className="w-full"
          >
            <button className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm bg-amber-600 hover:bg-amber-700 text-white hover:shadow-md">
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}