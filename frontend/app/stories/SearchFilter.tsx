"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import FilterSheet from "@/components/FilterSheet";
import type { StoryGenreInfo } from "@/data/data";

interface SearchFilterProps {
  genres: StoryGenreInfo[];
  selectedGenre?: string;
  initialSearch?: string;
}

export default function SearchFilter({ genres, selectedGenre, initialSearch = "" }: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    (value: string) => {
      setIsSearching(true);
      const params = new URLSearchParams(searchParams.toString());
      
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      
      // Reset to page 1 when searching to avoid 404 on empty results
      params.delete("page");
      
      const newUrl = `/stories${params.toString() ? `?${params.toString()}` : ""}`;
      router.push(newUrl, { scroll: false });
      
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== initialSearch) {
        debouncedSearch(searchValue);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchValue, debouncedSearch, initialSearch]);

  const clearSearch = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const newUrl = `/stories${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl, { scroll: false });
  };

  const searchParamsObj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "search") searchParamsObj[key] = value;
  });

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Search Input - Left */}
      <div className="relative flex-1 min-w-0 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="search"
          name="search"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search..."
          autoComplete="off"
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all text-sm"
        />
        {searchValue && !isSearching && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Sheet - Right */}
      <div className="relative shrink-0">
        <FilterSheet
          options={genres.map(g => ({ value: g.value, label: g.label }))}
          selectedValue={selectedGenre || null}
          baseUrl="/stories"
          searchParams={searchValue ? { search: searchValue } : undefined}
          title="Categories"
        />
      </div>
    </div>
  );
}
