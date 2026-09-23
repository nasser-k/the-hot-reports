import { Suspense } from "react";
import Link from "next/link";
import { Clock, Flame } from "lucide-react";
import { getCategories, listArticles } from "@/lib/api";
import NewsletterForm from "./NewsletterForm";
import EmptyState, { SidebarSkeleton } from "./EmptyState";
import type { Article, CategoryInfo } from "@/data/data";

async function SidebarContent() {
  let categories: CategoryInfo[] = [];
  let latest: Article[] = [];
  let mostRead: Article[] = [];
  let hasError = false;
  try {
    const [categoriesRes, latestRes, mostReadRes] = await Promise.all([
      getCategories(),
      listArticles({ page: 1, pageSize: 5 }),
      listArticles({ ordering: "-views_total", page: 1, pageSize: 5 }),
    ]);
    categories = categoriesRes;
    latest = latestRes.results;
    mostRead = mostReadRes.results;
  } catch {
    hasError = true;
    categories = [];
    latest = [];
    mostRead = [];
  }

  // Show empty state if both sections are empty
  if (latest.length === 0 && mostRead.length === 0 && !hasError) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <EmptyState variant="latest" />
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-5 text-white">
          <h3 className="text-lg font-black mb-2">Never Miss a Story</h3>
          <p className="text-sm text-red-100 mb-4 leading-relaxed">
            Subscribe to our newsletter and be the first to know when new articles are published.
          </p>
          <NewsletterForm />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Latest News */}
      {latest.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-red-600" />
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Latest News
            </h3>
          </div>
          <div className="space-y-0">
            {latest.map((article, idx) => {
              const catColor =
                categories.find((c) => c.slug === article.category.slug)?.color ||
                "#A21A47";
              return (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <span className="text-2xl sm:text-3xl font-black leading-none mt-0.5 flex-shrink-0 w-8 text-center text-gray-200 dark:text-gray-700 group-hover:text-red-500 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: catColor }}
                    >
                      {article.category.name}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h4>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString("en-UG", {
                        month: "short",
                        day: "numeric",
                        timeZone: "Africa/Kampala",
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Most Read / Trending */}
      {mostRead.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className="text-orange-500" />
          <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
            Most Read
          </h3>
        </div>
        <div className="space-y-0">
          {mostRead.map((article, idx) => {
            const catColor =
              categories.find((c) => c.slug === article.category.slug)?.color ||
              "#A21A47";
            return (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-2xl sm:text-3xl font-black leading-none mt-0.5 flex-shrink-0 w-8 text-center text-gray-200 dark:text-gray-700 group-hover:text-red-500 transition-colors">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: catColor }}
                  >
                    {article.category.name}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString("en-UG", {
                      month: "short",
                      day: "numeric",
                      timeZone: "Africa/Kampala",
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      )}

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-5 text-white">
        <h3 className="text-base sm:text-lg font-black mb-2">Stay Informed</h3>
        <p className="text-sm text-red-100 mb-4 leading-relaxed">
          Get the latest news delivered straight to your inbox every
          morning.
        </p>
        <NewsletterForm />
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function LatestNewsSidebar() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent />
    </Suspense>
  );
}
