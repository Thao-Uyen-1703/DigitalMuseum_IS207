import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function SortableHeader({
  label,
  sortKey,
  sortConfig, // Đã đổi thành số ít (object)
  onSort
}) {
  // Kiểm tra xem cột này có đang được active sort hay không
  const isActive = sortConfig && sortConfig.key === sortKey;

  return (
    <th
      className="
        px-6 py-4 text-left text-xs font-semibold
        text-gray-600 uppercase tracking-wider
        cursor-pointer hover:bg-gray-100
        transition-colors select-none
      "
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}

        <div className="flex items-center gap-0.5">
          {/* Đã xóa bỏ đoạn code hiển thị số thứ tự multiple sort ở đây */}

          <div className="flex flex-col">
            <ChevronUp
              size={12}
              className={
                isActive && sortConfig.direction === 'asc'
                  ? 'text-[#2C4C3E]'
                  : 'text-gray-300'
              }
            />

            <ChevronDown
              size={12}
              className={
                isActive && sortConfig.direction === 'desc'
                  ? 'text-[#2C4C3E] -mt-1'
                  : 'text-gray-300 -mt-1'
              }
            />
          </div>
        </div>
      </div>
    </th>
  );
}