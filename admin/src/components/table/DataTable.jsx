// components/table/DataTable.jsx

import React from 'react';
import SortableHeader from './SortableHeader';

export default function DataTable({
  columns,
  data,
  sortConfig,
  onSort,
  renderRow
}) {
  return (
    <div
      className="
        bg-white rounded-xl shadow-sm
        border border-gray-200 overflow-hidden
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">

          <thead
            className="
              bg-gray-50
              border-b border-gray-200
            "
          >
            <tr>
              {columns.map((column, index) => (
                column.sortable ? (
                  <SortableHeader
                    key={column.key}
                    label={column.label}
                    sortKey={column.key}
                    sortConfig={sortConfig}
                    onSort={onSort}
                  />
                ) : (
                  <th
                    key={`column-${index}`}
                    className="
                      px-6 py-4 text-left text-xs
                      font-semibold text-gray-600
                      uppercase tracking-wider
                    "
                  >
                    {column.label}
                  </th>
                )
              ))}
            </tr>
          </thead>

          <tbody
            className="
              divide-y divide-gray-100
            "
          >
            {data.map(renderRow)}
          </tbody>

        </table>
      </div>
    </div>
  );
}