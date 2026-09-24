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
import { listArticles } from "@/lib/api";
import type { Article } from "@/data/data";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com";
const SITE_NAME = "The Hot Reports";

const HOME_DESKS = [
  "national",
  "politics",
  "business",
  "technology",
  "education",
  "health",
  "sports",
  "culture-society",
  "op-ed",
  "africa",
  "world",
] as const;

async function loadDeskArticles() {
  const results = await Promise.all(
    HOME_DESKS.map((slug) =>
      listArticles({ category: slug, page: 1, pageSize: 6 })
        .then((res) => ({ slug, articles: res.results }))
        .catch(() => ({ slug, articles: [] as Article[] }))
    )
  );
  return new Map(results.map((result) => [result.slug, result.articles]));
}

function Desk({
  slug,
  layout,
  articles,
}: {
  slug: (typeof HOME_DESKS)[number];
  layout: "mixed" | "grid" | "list";
  articles: Article[];
}) {
  if (articles.length === 0) return null;
  return (
    <CategorySection
      categorySlug={slug}
      layout={layout}
      initialArticles={articles}
    />
  );
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
  const articlesBySlug = await loadDeskArticles();
  const articles = (slug: (typeof HOME_DESKS)[number]) => articlesBySlug.get(slug) ?? [];
  const hasLead = articles("national").length > 0 || articles("politics").length > 0;
  const hasMiddle =
    articles("business").length > 0 ||
    articles("technology").length > 0 ||
    articles("education").length > 0 ||
    articles("health").length > 0;
  const hasLower =
    articles("sports").length > 0 ||
    articles("culture-society").length > 0 ||
    articles("op-ed").length > 0;
  const hasWorld = articles("africa").length > 0 || articles("world").length > 0;

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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {hasLead && (
            <div className="xl:col-span-2 space-y-8 sm:space-y-10 order-2 xl:order-1">
              <Desk slug="national" layout="mixed" articles={articles("national")} />
              <Desk slug="politics" layout="mixed" articles={articles("politics")} />
            </div>
          )}
          <aside className={`space-y-6 ${hasLead ? "order-1 xl:order-2" : "xl:col-span-3"}`}>
            <div className="hidden xl:block">
              <LiveAdBannerWrapper slot="homepage_sidebar" />
            </div>
            <LatestNewsSidebar />
          </aside>
        </div>
      </div>

      {hasMiddle && (
      <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10">
          <Desk slug="business" layout="grid" articles={articles("business")} />
          <Desk slug="technology" layout="grid" articles={articles("technology")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Desk slug="education" layout="list" articles={articles("education")} />
            <Desk slug="health" layout="list" articles={articles("health")} />
          </div>
        </div>
      </div>
      )}

      {hasLower && (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Desk slug="sports" layout="list" articles={articles("sports")} />
          <Desk slug="culture-society" layout="list" articles={articles("culture-society")} />
        </div>
        <Desk slug="op-ed" layout="list" articles={articles("op-ed")} />
      </div>
      )}

      <TourismSection />

      {hasWorld && (
      <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Desk slug="africa" layout="list" articles={articles("africa")} />
            <Desk slug="world" layout="list" articles={articles("world")} />
          </div>
        </div>
      </div>
      )}

      <StoriesCTA />
      <FooterWrapper />
    </div>
  );
}
