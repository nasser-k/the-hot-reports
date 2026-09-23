import { Suspense } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { listArticles } from "@/lib/api";
import type { Article } from "@/data/data";

// Simple skeleton for trending bar
function TrendingBarSkeleton() {
  return (
    <div className="bg-gray-950 text-white overflow-hidden animate-soft-blink">
      <div className="max-w-[1400px] mx-auto px-4 flex items-center h-10">
        <div className="flex items-center gap-2 flex-shrink-0 pr-4">
          <div className="w-4 h-4 bg-gray-800 rounded" />
          <div className="h-4 bg-gray-800 rounded w-16" />
        </div>
        <div className="flex-1 ml-4 h-4 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}

async function TrendingContent() {
  let trending: Article[] = [];
  try {
    const res = await listArticles({ highlight: "trending", pageSize: 20 });
    trending = res.results;
  } catch {
    trending = [];
  }

  // Don't render anything if no trending articles
  if (trending.length === 0) return null;

  return (
    <div className="bg-gray-950 text-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 flex items-center h-10">
        <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-gray-700">
          <TrendingUp size={14} className="text-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            Trending
          </span>
        </div>
        <div className="overflow-hidden flex-1 ml-4">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* Only duplicate for marquee effect if 2+ articles, otherwise show once */}
            {(trending.length === 1 ? trending : [...trending, ...trending]).map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/article/${article.slug}`}
                className="inline-flex items-center gap-3 mr-8 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span className="truncate max-w-[300px]">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function TrendingBar() {
  return (
    <Suspense fallback={<TrendingBarSkeleton />}>
      <TrendingContent />
    </Suspense>
  );
}
