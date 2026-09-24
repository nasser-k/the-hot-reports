import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import type { Article } from "@/data/data";
import { listArticles, getSiteSettingsWithFallback } from "@/lib/api";
import { getNewsCategory, NEWS_CATEGORIES } from "@/lib/categories";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import CategoryArticlesGrid from "./CategoryArticlesGrid";
import { ArrowLeft, FileText, Feather, ChevronRight } from "lucide-react";

// Use dynamic rendering - pages are generated on-demand, not at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([
    Promise.resolve(getNewsCategory(slug)),
    getSiteSettingsWithFallback(),
  ]);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const title = settings.categoryMeta.titleTemplate.replace("{category}", category.name);

  return {
    title,
    description: settings.categoryMeta.description.replace("{category}", category.name),
    alternates: {
      canonical: `${settings.siteUrl}/category/${category.slug}`,
    },
    openGraph: {
      title,
      description: settings.categoryMeta.description.replace("{category}", category.name),
      type: "website",
      locale: "en_UG",
      url: `${settings.siteUrl}/category/${slug}`,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: settings.categoryMeta.description.replace("{category}", category.name),
      images: [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const cat = getNewsCategory(slug);
  if (!cat) notFound();

  const articlesPerPage = 6;
  const currentPage = parseInt(page || "1", 10);
  let pageRes: { results: Article[]; totalPages: number; count: number } = {
    results: [],
    totalPages: 1,
    count: 0,
  };
  try {
    pageRes = await listArticles({
      category: slug,
      page: currentPage,
      pageSize: articlesPerPage,
    });
  } catch {
    pageRes = { results: [], totalPages: 1, count: 0 };
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.name} News`,
    description: `Latest ${cat.name} news from The Hot Reports`,
    publisher: {
      "@type": "Organization",
      name: "The Hot Reports",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <NavbarWrapper />

        {/* Category header */}
        <div
          className="border-b border-gray-200 dark:border-gray-800"
          style={{ background: `linear-gradient(135deg, ${cat.color}08 0%, transparent 60%)` }}
        >
          <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
                <ArrowLeft size={14} />
                Home
              </Link>
              <span>/</span>
              <span style={{ color: cat.color }} className="font-semibold">{cat.name}</span>
            </nav>
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-9 sm:h-10 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  {cat.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Latest {cat.name} news from across Uganda.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
          {/* Top Ad - Responsive */}
          <div className="mb-6">
            <ResponsiveAdBanner desktopSlot="category_top" mobileSlot="category_top_mobile" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Grid - Client Component with instant navigation */}
            <div className="lg:col-span-2">
              <CategoryArticlesGrid
                initialArticles={pageRes.results}
                initialTotalPages={pageRes.totalPages}
                initialTotalCount={pageRes.count}
                categorySlug={slug}
                articlesPerPage={articlesPerPage}
              />
            </div>

            {/* Sidebar — always visible */}
            <aside className="space-y-6">
              {/* Other categories */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  More Categories
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {NEWS_CATEGORIES
                    .filter((c) => c.slug !== slug)
                    .map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className="flex items-center gap-2 px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </Link>
                    ))}
                </div>
              </div>

              {/* Stories CTA */}
              <Link
                href="/stories"
                className="block group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-orange-600 p-5 text-white hover:shadow-lg transition-all"
              >
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Feather className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Featured</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Explore Our Stories</h3>
                  <p className="text-sm text-red-100 mb-4">
                    Discover captivating narratives, series, and episodes by talented writers.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Read Stories</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Sticky sidebar ad */}
              <div className="lg:sticky lg:top-16 space-y-6">
                <LiveAdBannerWrapper slot="category_sidebar" />

                {/* Tourism promo in sidebar */}
                <Link
                  href="/tourism"
                  className="block bg-gradient-to-br from-gray-950 to-red-950 rounded-xl p-5 text-white hover:from-gray-900 hover:to-red-900 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1 relative">Explore Uganda</p>
                  <p className="font-black text-sm sm:text-base leading-snug relative">Discover safaris, lodges & experiences</p>
                  <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors relative">Browse tourism listings →</p>
                </Link>
              </div>
            </aside>
          </div>
        </div>

        <FooterWrapper />
      </div>
    </>
  );
}
