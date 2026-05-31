import React from 'react';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';

export default function CategoryTableRow({ category, onEdit, onDelete, onRestore }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-800">{category.CategoryName}</div>
      </td>

        <td className="px-6 py-4 text-sm text-gray-600">
        <div
            className="max-w-xs truncate"
            title={category.Description || ''}
        >
            {category.Description || '-'}
        </div>
        </td>

      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-800">{category.ProductCount ?? 0}</div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Chỉnh sửa">
            <Edit2 size={18} />
          </button>

        <button onClick={() => onDelete(category)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Ngưng hoạt động">
            <Trash2 size={18} />
        </button>
        </div>
      </td>
    </tr>
  );
}
