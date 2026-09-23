"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Check } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSheetProps {
  options: FilterOption[];
  selectedValue: string | null;
  baseUrl: string;
  searchParams?: Record<string, string>;
  title?: string;
  paramName?: string;
}

export default function FilterSheet({
  options,
  selectedValue,
  baseUrl,
  searchParams = {},
  title = "Filters",
  paramName = "genre",
}: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buildUrl = (value: string | null) => {
    const params = new URLSearchParams();
    
    // Add existing search params except the filter param
    Object.entries(searchParams).forEach(([key, val]) => {
      if (key !== "genre" && key !== "type") {
        params.set(key, val);
      }
    });
    
    // Add the filter value if not "all"
    if (value) {
      params.set(paramName, value);
    }
    
    const qs = params.toString();
    return `${baseUrl}${qs ? `?${qs}` : ""}`;
  };

  const selectedLabel = selectedValue 
    ? options.find(o => o.value === selectedValue)?.label 
    : "All Categories";

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>{selectedLabel}</span>
        {selectedValue && (
          <span className="ml-1 w-2 h-2 bg-red-600 rounded-full" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* All option */}
          <Link
            href={buildUrl(null)}
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-4 mb-2 rounded-xl border-2 transition-all ${
              !selectedValue
                ? "border-red-600 bg-red-50 dark:bg-red-950/20"
                : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
            }`}
          >
            <span className={`font-medium ${!selectedValue ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
              All Categories
            </span>
            {!selectedValue && <Check className="w-5 h-5 text-red-600" />}
          </Link>

          {/* Grid of options */}
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <Link
                  key={option.value}
                  href={buildUrl(option.value)}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-red-600 bg-red-50 dark:bg-red-950/20"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <span className={`font-medium text-sm ${isSelected ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {option.count} stories
                    </span>
                  )}
                  {isSelected && (
                    <div className="mt-2 flex justify-end">
                      <Check className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Apply button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div className="hidden lg:block absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
          <div className="p-2">
            {/* All option */}
            <Link
              href={buildUrl(null)}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                !selectedValue
                  ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
              }`}
            >
              <span className="font-medium">All Categories</span>
              {!selectedValue && <Check className="w-4 h-4" />}
            </Link>

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

            {/* Options */}
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <Link
                  key={option.value}
                  href={buildUrl(option.value)}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Click outside to close for desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 hidden lg:block"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
