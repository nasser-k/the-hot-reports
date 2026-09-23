import NavbarWrapper from "@/components/NavbarWrapper";
import TrendingBar from "@/components/TrendingBar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FooterWrapper from "@/components/FooterWrapper";
import LatestNewsSidebar from "@/components/LatestNewsSidebar";
import TourismSection from "@/components/TourismSection";
import StoriesCTA from "@/components/StoriesCTA";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import { listArticles, getCategories } from "@/lib/api";
import type { Article, CategoryInfo } from "@/data/data";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com";
const SITE_NAME = "The Hot Reports";

const HOME_CATEGORIES = [
  "national",
  "politics",
  "business",
  "technology",
  "education",
  "health",
  "sports",
  "culture-society",
  "africa",
  "world",
] as const;

async function prefetchHomeData() {
  const categories = await getCategories().catch(() => [] as CategoryInfo[]);

  const articleResults = await Promise.all(
    HOME_CATEGORIES.map((slug) =>
      listArticles({ category: slug, page: 1, pageSize: 6 })
        .then((res) => ({ slug, articles: res.results, error: false }))
        .catch(() => ({ slug, articles: [] as Article[], error: true }))
    )
  );

  const articlesBySlug = new Map<string, Article[]>();
  for (const result of articleResults) {
    articlesBySlug.set(result.slug, result.articles);
  }

  return { categories, articlesBySlug };
}

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
      description:
        "Nationwide news, serial stories, and travel reporting from across Uganda.",
      areaServed: {
        "@type": "Country",
        name: "Uganda",
      },
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "Nationwide news, serial stories, and travel reporting from across Uganda.",
      publisher: { "@type": "NewsMediaOrganization", name: SITE_NAME },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function Home() {
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

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <ResponsiveAdBanner
            desktopSlot="homepage_banner"
            mobileSlot="homepage_mobile"
            className="py-3 sm:py-4"
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="xl:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">
            <CategorySection
              categorySlug="national"
              layout="mixed"
              initialArticles={articlesBySlug.get("national") ?? []}
              allCategories={categories}
            />
            <CategorySection
              categorySlug="politics"
              layout="mixed"
              initialArticles={articlesBySlug.get("politics") ?? []}
              allCategories={categories}
            />
            <CategorySection
              categorySlug="business"
              layout="grid"
              initialArticles={articlesBySlug.get("business") ?? []}
              allCategories={categories}
            />
          </div>

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

      <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10">
          <CategorySection
            categorySlug="technology"
            layout="grid"
            initialArticles={articlesBySlug.get("technology") ?? []}
            allCategories={categories}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <CategorySection
              categorySlug="education"
              layout="list"
              initialArticles={articlesBySlug.get("education") ?? []}
              allCategories={categories}
            />
            <CategorySection
              categorySlug="health"
              layout="list"
              initialArticles={articlesBySlug.get("health") ?? []}
              allCategories={categories}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <CategorySection
            categorySlug="sports"
            layout="list"
            initialArticles={articlesBySlug.get("sports") ?? []}
            allCategories={categories}
          />
          <CategorySection
            categorySlug="culture-society"
            layout="list"
            initialArticles={articlesBySlug.get("culture-society") ?? []}
            allCategories={categories}
          />
        </div>
      </div>

      <TourismSection />

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

      <StoriesCTA />

      <FooterWrapper />
    </div>
  );
}
