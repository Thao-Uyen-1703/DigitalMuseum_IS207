import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  align,
  width
}) {
  const isActive = sortConfig && sortConfig.key === sortKey;

  const getAlignClass = (align) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const getFlexAlign = (align) => {
    switch (align) {
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  };

  return (
    <th
      className={`
        px-6 py-4 text-xs font-semibold
        text-gray-600 uppercase tracking-wider
        cursor-pointer hover:bg-gray-100
        transition-colors select-none
        ${getAlignClass(align)}
        ${width || ''}
        `} 
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-1.5 ${getFlexAlign(align)}`}>
        {label}

        <div className="flex items-center gap-0.5">

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