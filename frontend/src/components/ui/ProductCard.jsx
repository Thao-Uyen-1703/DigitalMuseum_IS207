import { ShoppingCart, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import noImage from '../../assets/no-image.png';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseFloat(price));
  };

  // Image URL from public/images folder
  const getImageUrl = () => {
    if (imageError || !product.ImageURL) {
      return noImage;
    }
    return `/images/${product.ImageURL}`;
  };

  const handleImageError = (e) => {
    // Only set error once to prevent infinite loops
    if (!imageError) {
      setImageError(true);
      e.target.src = noImage;
    }
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-40 overflow-hidden bg-gray-200">
        <img
          src={getImageUrl()}
          alt={product.ProductName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={handleImageError}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-bold text-base text-gray-800 mb-2 line-clamp-2">
          {product.ProductName}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          {product.Description}
        </p>

        {/* Origin/Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>{product.Origin || 'Việt Nam'}</span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-amber-600">
            {formatPrice(product.Price || 0)}
          </span>
          {product.Stock !== undefined && product.Stock > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Còn hàng
            </span>
          )}
        </div>

        {/* Story/Comment */}
        {product.CulturalStory && (
          <p className="text-xs text-amber-700 italic mt-2 line-clamp-1">
            ✨ {product.CulturalStory}
          </p>
        )}

        <div className="w-full flex justify-center mt-5">
          <Link
            to={`/san-pham/${product.SlugName || ''}`}
            className="w-full"
          >
            <button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm sm:text-base">
              Xem chi tiết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
