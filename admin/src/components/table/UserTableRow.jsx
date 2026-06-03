import React from 'react';
import { Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function UserTableRow({ user, onEdit, onToggleActive }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-800">{user.FullName}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" title={user.Email}>
        {user.Email}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{user.Role}</td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleActive(user)}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${user.IsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
        >
          {user.IsActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {user.IsActive ? 'Hoạt động' : 'Vô hiệu'}
        </button>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onEdit(user)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Chỉnh sửa"
        >
          <Edit2 size={18} />
        </button>
      </td>
    </tr>
  );
}
