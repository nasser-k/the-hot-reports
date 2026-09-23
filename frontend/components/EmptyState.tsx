"use client";

import Link from "next/link";
import {
  FileText,
  Newspaper,
  Search,
  Compass,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface EmptyStateProps {
  variant:
    | "articles"
    | "category"
    | "search"
    | "tourism"
    | "trending"
    | "latest"
    | "featured"
    | "error"
    | "default";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
  className?: string;
  categoryName?: string;
}

const icons = {
  articles: Newspaper,
  category: FileText,
  search: Search,
  tourism: Compass,
  trending: TrendingUp,
  latest: Clock,
  featured: Newspaper,
  error: AlertTriangle,
  default: FileText,
};

interface DefaultMessage {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const defaultMessages: Record<string, DefaultMessage> = {
  articles: {
    title: "No Articles Yet",
    description: "We're working on bringing you the latest news. Check back soon!",
  },
  category: {
    title: "No Articles in This Category",
    description: "We haven't published any articles in this category yet.",
  },
  search: {
    title: "No Results Found",
    description: "Try adjusting your search terms or browse our categories.",
    actionLabel: "Clear Search",
    actionHref: "/",
  },
  tourism: {
    title: "No Listings Yet",
    description: "Discover amazing places in Uganda coming soon!",
  },
  trending: {
    title: "No Trending Stories",
    description: "Trending stories will appear here as readers engage with our content.",
  },
  latest: {
    title: "No Latest News",
    description: "Fresh news updates will appear here shortly.",
  },
  featured: {
    title: "No Featured Articles",
    description: "Our editors are curating the best articles for you.",
  },
  error: {
    title: "Oops! Something went wrong",
    description: "We couldn't load this content. Please try again later.",
    actionLabel: "Try Again",
  },
  default: {
    title: "Nothing Here Yet",
    description: "This section is coming soon. Check back later!",
  },
};

export default function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  onRetry,
  className = "",
  categoryName,
}: EmptyStateProps) {
  const Icon = icons[variant];
  const defaults = defaultMessages[variant];

  const finalTitle = title || defaults.title;
  const finalDescription =
    description ||
    (variant === "category" && categoryName
      ? `We haven't published any ${categoryName.toLowerCase()} articles yet. Check back soon for updates!`
      : defaults.description);
  const finalActionLabel = actionLabel || defaults.actionLabel;
  const finalActionHref = actionHref || defaults.actionHref;

  // Internal retry handler for error variant
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };
  const isErrorVariant = variant === "error";

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
        <Icon size={36} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
        {finalTitle}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-sm mb-6 leading-relaxed">
        {finalDescription}
      </p>
      {finalActionLabel && finalActionHref && !isErrorVariant && (
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href={finalActionHref}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors text-sm"
          >
            {finalActionLabel}
          </Link>
        </div>
      )}
      {(onRetry || isErrorVariant) && (
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={onRetry || handleRetry}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors text-sm"
          >
            {finalActionLabel || "Try Again"}
          </button>
        </div>
      )}
    </div>
  );
}

// Skeleton components for loading states
export function ArticleCardSkeleton({ variant = "standard" }: { variant?: string }) {
  const heightClasses = {
    hero: "h-80 sm:h-96",
    featured: "h-48 sm:h-56",
    standard: "h-40",
    horizontal: "h-24",
    compact: "h-16",
  };

  if (variant === "horizontal") {
    return (
      <div className="flex gap-4 p-3 animate-pulse">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${heightClasses[variant as keyof typeof heightClasses] || "h-40"} bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse`}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}

export function HeroSectionSkeleton() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main hero skeleton */}
        <div className="lg:col-span-2 h-80 sm:h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        {/* Side articles skeleton */}
        <div className="flex flex-col gap-5">
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Latest News */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Most Read */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TourismCardSkeleton() {
  return (
    <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/[0.08] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="flex justify-between pt-2">
          <div className="h-3 bg-gray-700 rounded w-16" />
          <div className="h-3 bg-gray-700 rounded w-12" />
        </div>
      </div>
    </div>
  );
}
