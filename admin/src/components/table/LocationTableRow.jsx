import React from 'react';
import { Edit2, MapPin, Trash2 } from 'lucide-react';
import ImageDisplay from '../common/ImageDisplay';

export default function LocationTableRow({ location, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors group/row">
      <td className="px-4 md:px-6 py-4 w-20">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
          <ImageDisplay
            src={location.ThumbnailURL}
            alt={location.LocationName}
            className="w-full h-full object-cover"
          />
        </div>
      </td>

      <td className="px-4 md:px-6 py-4">
        <div className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2">
          {location.LocationName}
        </div>
        {location.LocationID && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
            <span>{location.City}</span>
        </div>
        )}
      </td>

      <td className="px-4 md:px-6 py-4">
        <div
          className="text-xs md:text-sm text-gray-600 min-w-[140px] max-w-[180px] sm:max-w-[250px] lg:max-w-sm xl:max-w-md"
          title={location.Details || 'Không có mô tả'}
        >
          {location.Details ? (
            <p className="line-clamp-2 md:line-clamp-3 whitespace-normal break-words leading-relaxed">
              {location.Details}
            </p>
          ) : (
            <span className="italic text-gray-400">Chưa cập nhật...</span>
          )}
        </div>
      </td>

        <td className="px-4 md:px-6 py-4">
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            location.IsFeatured
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
            {location.IsFeatured ? 'Hoạt động' : 'Chưa hoạt động'}
        </span>
        </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(location)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Chỉnh sửa">
            <Edit2 size={18} />
          </button>

        <button onClick={() => onDelete(location)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Ngưng hoạt động">
            <Trash2 size={18} />
        </button>
        </div>
      </td>
    </tr>
  );
}