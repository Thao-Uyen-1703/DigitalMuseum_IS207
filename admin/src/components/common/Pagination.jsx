import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, itemPerPage, onPageChange, onItemPerPageChange }) {
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

    if (totalPages <= 1) {
    return (
        <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2">

            <span className="text-sm text-gray-600">
            Hiển thị
            </span>

            <select
            value={itemPerPage}
            onChange={(e) =>
                onItemPerPageChange(Number(e.target.value))
            }
            className="
                px-3 py-2 rounded-lg
                border border-gray-300
                bg-white text-sm
            "
            >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            </select>

            <span className="text-sm text-gray-600">
            / trang
            </span>

        </div>
        </div>
    );
    }

  const pageNumbers = getPageNumbers();
  const showLeftEllipsis = pageNumbers[0] > 1;
  const showRightEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <div className="flex items-center gap-2">

        <span className="text-sm text-gray-600">
          Hiển thị
        </span>

        <select
          value={itemPerPage}
          onChange={(e) =>
            onItemPerPageChange(Number(e.target.value))
          }
          className="
            px-3 py-2 rounded-lg
            border border-gray-300
            bg-white text-sm
            focus:outline-none
            focus:ring-2 focus:ring-green-500
          "
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <span className="text-sm text-gray-600">
          / trang
        </span>

      </div>

      {/* Prev Button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        title="Trang trước"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Left Ellipsis */}
      {showLeftEllipsis && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            1
          </button>
          <span className="px-2 text-gray-600">...</span>
        </>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg transition font-medium ${
            currentPage === page
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Right Ellipsis */}
      {showRightEllipsis && (
        <>
          <span className="px-2 text-gray-600">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        title="Trang sau"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
