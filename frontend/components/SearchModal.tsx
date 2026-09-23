"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { getCategories, listArticles } from "@/lib/api";
import type { Article, CategoryInfo } from "@/data/data";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Use transitions to satisfy react-hooks/set-state-in-effect rule.
      setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    // Fetch trending articles for popular searches
    listArticles({ highlight: "trending", pageSize: 5, noStore: true })
      .then((r) => setTrendingArticles(r.results))
      .catch(() => setTrendingArticles([]));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    let cancelled = false;
    if (query.length < 2) {
      setTimeout(() => {
        if (!cancelled) setResults([]);
      }, 0);
      return;
    }

    const t = setTimeout(() => {
      listArticles({ search: query, page: 1, pageSize: 20, noStore: true })
        .then((r) => {
          if (!cancelled) setResults(r.results);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] sm:pt-[10vh] md:pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-2 sm:mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 dark:border-gray-800">
          <Search size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            id="search-modal"
            name="search-modal"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            autoComplete="off"
            className="flex-1 bg-transparent text-base sm:text-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-5">
              {/* Trending articles */}
              {trendingArticles.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp size={12} /> Trending Now
                  </p>
                  <div className="space-y-2 mb-6">
                    {trendingArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        onClick={onClose}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: article.category.color }}>
                            {article.category.name}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                            {article.title}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-red-500 mt-1 flex-shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Browse categories */}
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Browse Categories
              </p>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setQuery(cat.name)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Try different keywords or browse categories
              </p>
            </div>
          ) : (
            <div className="py-2">
              <p className="px-5 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {results.length} result{results.length !== 1 && "s"}
              </p>
              {results.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  onClick={onClose}
                  className="flex items-start gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: categories.find(c => c.slug === article.category.slug)?.color || article.category.color }}>
                      {article.category.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <Clock size={10} />
                      {new Date(article.publishedAt).toLocaleDateString("en-UG", {
                        month: "short",
                        day: "numeric",
                        timeZone: "Africa/Kampala",
                      })}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-300 dark:text-gray-600 group-hover:text-red-500 mt-2 flex-shrink-0 transition-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">ESC</kbd> to close
          </span>
          <span>Pulse of Kigezi Search</span>
        </div>
      </div>
    </div>
  );
}
