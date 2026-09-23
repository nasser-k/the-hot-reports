"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

// Hook to get responsive max visible pages
function useResponsiveMaxVisible(): number {
  // Default for SSR
  if (typeof window === "undefined") return 5;
  
  const width = window.innerWidth;
  if (width < 640) return 3;  // Mobile: show only 3 pages
  if (width < 768) return 5; // Tablet: show 5 pages
  return 7;                   // Desktop: show 7 pages
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = useResponsiveMaxVisible();
  const siblingCount = Math.floor((maxVisible - 3) / 2); // Pages around current

  if (totalPages <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Calculate which pages to show
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Always show first page
    pages.push(1);

    // Left ellipsis
    if (shouldShowLeftDots) {
      pages.push("...");
    } else if (leftSiblingIndex === 2) {
      pages.push(2);
    }

    // Middle pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Right ellipsis
    if (shouldShowRightDots) {
      pages.push("...");
    } else if (rightSiblingIndex === totalPages - 1) {
      pages.push(totalPages - 1);
    }

    // Always show last page
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-6 sm:py-8">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="flex items-center gap-1 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-2 sm:px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg cursor-not-allowed"
        >
          <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 sm:px-3 py-2 text-gray-500 dark:text-gray-400 text-sm"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-red-600 text-white"
                  : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="flex items-center gap-1 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} className="sm:w-4 sm:h-4" />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-2 sm:px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
}
