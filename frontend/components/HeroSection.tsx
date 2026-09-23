import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import ArticleCard from "./ArticleCard";
import EmptyState, { HeroSectionSkeleton } from "./EmptyState";
import { listArticles } from "@/lib/api";
import type { Article } from "@/data/data";
import { hasImage } from "@/lib/media";

async function HeroContent() {
  let featured: Article[] = [];
  let hasError = false;
  let isFallback = false;
  try {
    // Fetch both breaking and featured articles
    const [breakingRes, featuredRes] = await Promise.all([
      listArticles({ highlight: "breaking", pageSize: 4 }),
      listArticles({ highlight: "featured", pageSize: 4 }),
    ]);
    // Prioritize breaking news first, then featured
    featured = [...breakingRes.results, ...featuredRes.results];
  } catch {
    hasError = true;
    featured = [];
  }

  // Fallback: if no breaking/featured articles, get the latest published articles
  if (featured.length === 0 && !hasError) {
    try {
      const res = await listArticles({ pageSize: 4 });
      featured = res.results;
      isFallback = true; // Mark as fallback to suppress badges
    } catch {
      featured = [];
    }
  }

  const heroArticle = featured[0];
  const sideArticles = featured.slice(1, 4);

  // Show empty state when no articles at all
  if (!heroArticle) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState variant={hasError ? "error" : "featured"} />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main hero */}
        <div className="lg:col-span-2">
          <ArticleCard article={heroArticle} variant="hero" />
        </div>

        {/* Side featured articles */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {sideArticles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className={`group block overflow-hidden rounded-xl ${hasImage(article.image) ? 'relative aspect-[3/2] sm:aspect-[16/9] lg:aspect-auto lg:flex-1' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 lg:flex-1 flex flex-col justify-center'}`}
            >
              {hasImage(article.image) && (
                <>
                  <Image
                    src={article.image!}
                    alt={article.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </>
              )}
              {!isFallback && article.highlight === "breaking" && (
                <div className={`${hasImage(article.image) ? 'absolute top-3 left-3' : 'mb-2'} px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse inline-block`}>
                  Breaking
                </div>
              )}
              {!isFallback && article.highlight === "featured" && (
                <div className={`${hasImage(article.image) ? 'absolute top-3 left-3' : 'mb-2'} px-2 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full inline-block`}>
                  Featured
                </div>
              )}
              <div className={`${hasImage(article.image) ? 'absolute bottom-0 left-0 right-0 p-3 sm:p-4' : ''}`}>
                <h3 className={`text-sm sm:text-base font-bold leading-snug line-clamp-2 group-hover:text-red-400 transition-colors ${hasImage(article.image) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main export with Suspense boundary
export default function HeroSection() {
  return (
    <Suspense fallback={<HeroSectionSkeleton />}>
      <HeroContent />
    </Suspense>
  );
}
