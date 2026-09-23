"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ClientPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ClientPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous button */}
      {currentPage > 1 ? (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-full opacity-40 cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-9 h-9 text-sm font-semibold rounded-full transition-all ${
                currentPage === page
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all"
        >
          Next
          <ChevronRight size={16} />
        </button>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-full opacity-40 cursor-not-allowed"
        >
          Next
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
