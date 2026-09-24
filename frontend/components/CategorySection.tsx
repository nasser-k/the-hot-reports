import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { CategorySectionSkeleton } from "./EmptyState";
import { getNewsCategory } from "@/lib/categories";
import type { Article } from "@/data/data";

interface CategorySectionProps {
  categorySlug: string;
  layout?: "grid" | "list" | "mixed";
  initialArticles: Article[];
}

async function CategoryContent({
  categorySlug,
  layout = "mixed",
  initialArticles,
}: CategorySectionProps) {
  const slug = categorySlug;
  const articles = initialArticles;
  const cat = getNewsCategory(categorySlug);
  const catColor = cat?.color || "#A21A47";
  const categoryName = cat?.name || categorySlug;

  if (articles.length === 0) {
    return null;
  }

  return (
    <section id={slug} className="scroll-mt-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-1 h-6 sm:h-7 rounded-full"
            style={{ backgroundColor: catColor }}
          />
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
            {categoryName}
          </h2>
        </div>
        {articles.length > 0 && (
          <Link
            href={`/category/${slug}`}
            className="flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all"
            style={{ color: catColor }}
          >
            View All <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Content */}
      {layout === "mixed" && articles.length >= 3 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {/* Featured article - full on mobile, 3/5 cols on desktop */}
          <div className="lg:col-span-3">
            <ArticleCard article={articles[0]} variant="featured" />
          </div>
          {/* Side articles - show 2 on mobile/tablet, 3 on desktop */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:col-span-2">
            {articles.slice(1, 3).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
              />
            ))}
            <div className="hidden lg:block">
              {articles[3] && (
                <ArticleCard
                  article={articles[3]}
                  variant="horizontal"
                />
              )}
            </div>
          </div>
        </div>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {/* Show 3 on mobile, 4 on tablet, 6 on desktop (max 6) */}
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
          <div className="hidden sm:block lg:hidden">
            {articles[3] && (
              <ArticleCard article={articles[3]} variant="standard" />
            )}
          </div>
          <div className="hidden lg:block">
            {articles.slice(3, 6).map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {/* List layout - show 3 on mobile, 4 on desktop (max 4) */}
          {articles.slice(0, 3).map((article) => (
            <div key={article.id} className="py-2 sm:py-3 first:pt-0">
              <ArticleCard
                article={article}
                variant="horizontal"
              />
            </div>
          ))}
          <div className="hidden lg:block py-2 sm:py-3">
            {articles[3] && (
              <ArticleCard
                article={articles[3]}
                variant="horizontal"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Main export with Suspense boundary
export default function CategorySection(props: CategorySectionProps) {
  return (
    <Suspense fallback={<CategorySectionSkeleton />}>
      <CategoryContent {...props} />
    </Suspense>
  );
}
