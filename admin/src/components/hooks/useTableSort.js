import { useState } from 'react';

export default function useTableSort() {
  const [sortConfig, setSortConfig] = useState(null);

  const requestSort = (key) => {
    setSortConfig((prevSort) => {
      if (prevSort && prevSort.key === key) {
        if (prevSort.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null; 
      }
      
      return { key, direction: 'asc' };
    });
  };

  const clearAllSorts = () => {
    setSortConfig(null);
  };

  return {
    sortConfig,
    requestSort,
    clearAllSorts
  };
}