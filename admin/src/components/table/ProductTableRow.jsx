import React from 'react';
import { MapPin, Edit2, Trash2, RotateCcw } from 'lucide-react';
import ImageDisplay from '../common/ImageDisplay';

export default function ProductTableRow({ product, onEdit, onDelete, onRestore }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
          {product.ImageURL ? (
            <ImageDisplay 
              src={product.ImageURL} 
              alt={product.ProductName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-gray-400 text-[10px] text-center leading-tight">Không ảnh</div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="font-medium text-gray-800 flex items-center gap-2">
          {product.ProductName}
        </div>
        
        {product.LocationName && (
          <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <MapPin size={12} className="text-gray-400" />
            {product.LocationName}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="text-sm text-gray-700">
          {product.CategoryName || <span className="text-gray-400 italic">Chưa phân loại</span>}
        </div>
      </td>

      <td className="px-6 py-4 font-semibold text-[#2C4C3E]">
        {new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(product.Price || 0)}
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
          product.Stock > 0
            ? 'bg-blue-50 text-blue-700 border border-blue-100'
            : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {product.Stock > 0 ? `${product.Stock} SP` : 'Hết hàng'}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
          product.IsActive
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-gray-100 border-gray-200 text-gray-600'
        }`}>
          {product.IsActive ? 'Hoạt động' : 'Đã ẩn'}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
            title="Chỉnh sửa"
          >
            <Edit2 size={18} />
          </button>

          {product.IsActive ? (
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition"
              title="Ngưng hoạt động"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={() => onRestore(product)}
              className="p-2 text-[#2C4C3E] hover:bg-[#2C4C3E]/10 rounded-lg transition"
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