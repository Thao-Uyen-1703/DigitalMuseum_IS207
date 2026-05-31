// components/table/ProductTable.jsx
import React from 'react';
import { MapPin, Edit2, Trash2, RotateCcw } from 'lucide-react';
import ImageDisplay from '../common/ImageDisplay';

export default function ProductTableRow({ product, onEdit, onDelete, onRestore }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      {/* Cột Hình ảnh */}
      <td className="px-6 py-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {product.ImageURL ? (
            <ImageDisplay 
              src={product.ImageURL} 
              alt={product.ProductName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-gray-400 text-xs">Không ảnh</div>
          )}
        </div>
      </td>

      {/* Cột Tên sản phẩm & Vị trí */}
      <td className="px-6 py-4">
        <div className="font-medium text-gray-800 flex items-center gap-2">
          {product.ProductName}
          {product.Slug && (
            <span className="text-xs text-gray-400 font-normal">
              ({product.Slug})
            </span>
          )}
        </div>
        
        {/* Kết hợp Location (nếu có) hoặc Category */}
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          {product.LocationName ? (
            <>
              <MapPin size={12} className="text-gray-400" />
              {product.LocationName}
            </>
          ) : (
             product.CategoryName && product.CategoryName
          )}
        </div>
      </td>

      {/* Cột Giá */}
      <td className="px-6 py-4 font-medium text-green-600">
        {new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(product.Price || 0)}
      </td>

      {/* Cột Tồn kho */}
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          product.Stock > 0
            ? 'bg-blue-100 text-blue-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {product.Stock > 0 ? `${product.Stock} SP` : 'Hết hàng'}
        </span>
      </td>

      {/* Cột Trạng thái */}
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          product.IsActive
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-100 border-gray-200 text-red-700'
        }`}>
          {product.IsActive ? 'Hoạt động' : 'Ngưng hoạt động'}
        </span>
      </td>

      {/* Cột Thao tác */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Chỉnh sửa"
          >
            <Edit2 size={18} />
          </button>

          {product.IsActive ? (
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Ngưng hoạt động"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={() => onRestore(product)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Kích hoạt lại"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}