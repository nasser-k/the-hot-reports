"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listArticles } from "@/lib/api";
import type { Article } from "@/data/data";
import ArticleCard from "@/components/ArticleCard";
import ClientPagination from "@/components/ClientPagination";
import { FileText } from "lucide-react";

interface CategoryArticlesGridProps {
  initialArticles: Article[];
  initialTotalPages: number;
  initialTotalCount: number;
  categorySlug: string;
  articlesPerPage: number;
}

export default function CategoryArticlesGrid({
  initialArticles,
  initialTotalPages,
  initialTotalCount,
  categorySlug,
  articlesPerPage,
}: CategoryArticlesGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch new articles when page changes
  const fetchArticles = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await listArticles({
        category: categorySlug,
        page: page,
        pageSize: articlesPerPage,
      });
      
      setArticles(res.results);
      setTotalPages(res.totalPages);
      setTotalCount(res.count);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, articlesPerPage]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    // Update URL with shallow routing (no page reload)
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl, { scroll: false });
    
  }, [router, searchParams]);

  // Fetch when page changes via URL
  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage, fetchArticles]);

  const displayArticles = currentPage === 1 && articles.length > 0
    ? articles.slice(1) // Skip hero article on first page
    : articles;

  return (
    <div id="articles-grid">
      {/* Hero article - full width (only on first page) */}
      {currentPage === 1 && articles[0] && (
        <div className="mb-8">
          <ArticleCard article={articles[0]} variant="hero" />
        </div>
      )}

      {/* Articles Grid */}
      <div className={`space-y-6 ${isLoading ? "opacity-50" : ""}`}>
        {displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
                <FileText size={36} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
                No articles in this category yet. Check back soon for new content!
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
