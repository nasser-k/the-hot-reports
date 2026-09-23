import NavbarWrapper from "@/components/NavbarWrapper";
import TrendingBar from "@/components/TrendingBar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import FooterWrapper from "@/components/FooterWrapper";
import LatestNewsSidebar from "@/components/LatestNewsSidebar";
import TourismSection from "@/components/TourismSection";
import StoriesCTA from "@/components/StoriesCTA";
import { listArticles, getCategories } from "@/lib/api";
import type { Article, CategoryInfo } from "@/data/data";

// Revalidate homepage every 5 minutes for fresh content
export const revalidate = 300;

// All category slugs used on homepage
const HOME_CATEGORIES = [
  "kigezi-news",
  "national",
  "technology",
  "politics",
  "business",
  "education",
  "sports",
  "africa",
  "world",
] as const;

async function prefetchHomeData() {
  // Fetch categories once
  const categories = await getCategories().catch(() => [] as CategoryInfo[]);

  // Fetch all category articles in parallel (single batch)
  const articleResults = await Promise.all(
    HOME_CATEGORIES.map((slug) =>
      listArticles({ category: slug, page: 1, pageSize: 6 })
        .then((res) => ({ slug, articles: res.results, error: false }))
        .catch(() => ({ slug, articles: [] as Article[], error: true }))
    )
  );

  // Build lookup map
  const articlesBySlug = new Map<string, Article[]>();
  for (const result of articleResults) {
    articlesBySlug.set(result.slug, result.articles);
  }

  return { categories, articlesBySlug };
}

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pulse of Kigezi",
  alternateName: "PoKi",
  url: "https://pulseofkigezi.com",
  description:
    "Delivering accurate, timely, and impactful news coverage from the Kigezi sub-region.",
  publisher: {
    "@type": "Organization",
    name: "Pulse of Kigezi",
    logo: {
      "@type": "ImageObject",
      url: "https://pulseofkigezi.com/icons/icon.svg",
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://pulseofkigezi.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function Home() {
  // Prefetch all category data on server (prevents client fetch delay)
  const { categories, articlesBySlug } = await prefetchHomeData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <NavbarWrapper />
      <TrendingBar />
      <HeroSection />

      {/* Ad after hero - responsive */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <ResponsiveAdBanner
            desktopSlot="homepage_banner"
            mobileSlot="homepage_mobile"
            className="py-3 sm:py-4"
          />
        </div>
      </div>

      {/* ── Section 1: Main content + sidebar ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main column */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">
            <CategorySection
              categorySlug="kigezi-news"
              layout="mixed"
              initialArticles={articlesBySlug.get("kigezi-news") ?? []}
              allCategories={categories}
            />

            {/* Leaderboard - Responsive */}
            <div>
              <ResponsiveAdBanner
                desktopSlot="homepage_banner"
                mobileSlot="homepage_mobile"
              />
            </div>

            <CategorySection
              categorySlug="national"
              layout="mixed"
              initialArticles={articlesBySlug.get("national") ?? []}
              allCategories={categories}
            />
            <CategorySection
              categorySlug="technology"
              layout="grid"
              initialArticles={articlesBySlug.get("technology") ?? []}
              allCategories={categories}
            />
          </div>

          {/* Sidebar - moves below on mobile/tablet */}
          <aside className="space-y-4 sm:space-y-6 xl:space-y-6">
            <div className="hidden sm:block">
              <LiveAdBannerWrapper slot="homepage_sidebar" />
            </div>
            <div className="block sm:hidden">
              <ResponsiveAdBanner desktopSlot="homepage_banner" mobileSlot="homepage_mobile" />
            </div>
            <LatestNewsSidebar />
          </aside>
        </div>
      </div>

      {/* ── Section 2: Politics + Business - alternate bg ── */}
      <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10">
          <CategorySection
          categorySlug="politics"
          layout="mixed"
          initialArticles={articlesBySlug.get("politics") ?? []}
          allCategories={categories}
        />

          {/* Leaderboard - Responsive */}
          <div>
            <ResponsiveAdBanner
              desktopSlot="homepage_banner"
              mobileSlot="homepage_mobile"
            />
          </div>

          <CategorySection
          categorySlug="business"
          layout="grid"
          initialArticles={articlesBySlug.get("business") ?? []}
          allCategories={categories}
        />
        </div>
      </div>

      {/* ── Section 3: Education + Sports ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <CategorySection
              categorySlug="education"
              layout="list"
              initialArticles={articlesBySlug.get("education") ?? []}
              allCategories={categories}
            />
          <CategorySection
              categorySlug="sports"
              layout="list"
              initialArticles={articlesBySlug.get("sports") ?? []}
              allCategories={categories}
            />
        </div>

        {/* Leaderboard - Responsive */}
        <div>
          <ResponsiveAdBanner
            desktopSlot="homepage_banner"
            mobileSlot="homepage_mobile"
          />
        </div>
      </div>

      {/* ── Section 4: Tourism showcase - full width ── */}
      <TourismSection />

      {/* ── Section 5: Africa + World - alternate bg ── */}
      <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <CategorySection
            categorySlug="africa"
            layout="list"
            initialArticles={articlesBySlug.get("africa") ?? []}
            allCategories={categories}
          />
            <CategorySection
            categorySlug="world"
            layout="list"
            initialArticles={articlesBySlug.get("world") ?? []}
            allCategories={categories}
          />
          </div>
        </div>
      </div>

      {/* ── Section 6: Stories CTA - full width ── */}
      <StoriesCTA />

      <FooterWrapper />
    </div>
  );
}
