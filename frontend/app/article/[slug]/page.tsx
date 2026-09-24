import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getArticle,
  getRelated,
  getSiteSettingsWithFallback,
  isApiNotFound,
} from "@/lib/api";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import ArticleCard from "@/components/ArticleCard";
import { Clock, ArrowLeft, Tag, Feather, ChevronRight } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import TrackArticleView from "@/components/TrackArticleView";
import { getNewsCategory } from "@/lib/categories";
import InlineContentImage from "@/components/InlineContentImage";
import { hasImage } from "@/lib/media";

interface Props {
  params: Promise<{ slug: string }>;
}

// Use dynamic rendering - pages are generated on-demand, not at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    getArticle(slug).catch(() => null),
    getSiteSettingsWithFallback(),
  ]);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const seoTitle = article.metaTitle || article.title;
  const title = `${seoTitle} | ${settings.siteName}`;
  const seoDescription = article.metaDescription || article.excerpt || settings.articleMeta.description;

  return {
    title,
    description: seoDescription,
    keywords: article.metaKeywords ? article.metaKeywords.split(",").map((k) => k.trim()) : undefined,
    alternates: {
      canonical: `${settings.siteUrl}/article/${article.slug}`,
    },
    openGraph: {
      title,
      description: seoDescription,
      type: "article",
      locale: "en_UG",
      url: `${settings.siteUrl}/article/${slug}`,
      siteName: settings.siteName,
      images: article.image
        ? [
            {
              url: article.image,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: article.image ? [article.image] : undefined,
      site: settings.twitterHandle,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article;
  try {
    article = await getArticle(slug);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }

  const related = await getRelated(slug);
  const catInfo = getNewsCategory(article.category.slug) || article.category;
  const catColor = catInfo.color || "#A21A47";

  const publishDate = new Date(article.publishedAt).toLocaleDateString("en-UG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Kampala",
  });

  const articleContent = (article.content || "").trim() || article.excerpt;

  // Check if content is HTML (contains HTML tags)
  const isHtml = /<(br|p|div|span|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|img|blockquote|code|pre)[^>]*>/i.test(articleContent);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: hasImage(article.image) ? article.image : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "The Hot Reports",
      logo: {
        "@type": "ImageObject",
        url: "/icons/icon-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/article/${article.slug}`,
    },
    articleSection: article.category.name,
    keywords: article.tags.join(", "),
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com"}/article/${article.slug}`;
  const shareText = encodeURIComponent(article.title);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <NavbarWrapper />
        <TrackArticleView slug={slug} />

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1 whitespace-nowrap">
                <ArrowLeft size={13} />
                Home
              </Link>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <Link
                href={`/category/${catInfo?.slug || article.category.slug || ""}`}
                className="hover:text-red-600 transition-colors font-medium whitespace-nowrap"
                style={{ color: catColor }}
              >
                {article.category.name}
              </Link>
              <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">/</span>
              <span className="text-gray-400 dark:text-gray-500 truncate max-w-[300px] hidden sm:inline">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Article layout */}
        <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
          {/* Top Ad - Responsive */}
          <div className="mb-6">
            <ResponsiveAdBanner desktopSlot="article_top" mobileSlot="article_top_mobile" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main content */}
            <article className="lg:col-span-2 min-w-0">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-[1.15] mb-4">
                {article.title}
              </h1>

              {/* Excerpt */}
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-serif italic text-justify">
                {article.excerpt}
              </p>

              {/* Author & meta bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-5 mb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Image
                    src={article.author.avatar}
                    alt="Reporter"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-800"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Reporter
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {publishDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                    <Clock size={12} />
                    {article.readTime} min read
                  </span>
                </div>
              </div>

              {/* Share bar */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">Share</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:bg-[#166fe5] transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  aria-label="Share on X"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center bg-[#25D366] text-white rounded-full hover:bg-[#22c35e] transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347-.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:bg-[#0958a8] transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <ShareButton url={shareUrl} title={article.title} text={article.excerpt} />
              </div>

              {/* Article body — inline image + mid-article ad */}
              <div className="max-w-none mb-8 min-w-0 break-words">
                {article.image ? (
                  <>
                    <InlineContentImage
                      src={article.image}
                      alt={article.title}
                      priority
                    />
                    {article.imageAttribution && (
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 italic text-center sm:text-left mb-4">
                        {article.imageAttribution}
                      </p>
                    )}
                  </>
                ) : null}
                {isHtml ? (
                  <div
                    className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-justify break-words
                      prose-p:text-gray-800 dark:prose-p:text-gray-200
                      prose-headings:text-gray-900 dark:prose-headings:text-white
                      prose-a:text-red-600 hover:prose-a:text-red-700
                      prose-strong:text-gray-900 dark:prose-strong:text-white
                      prose-blockquote:border-l-red-600 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900/50
                      prose-code:text-red-600 prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                      prose-pre:bg-gray-900 prose-pre:text-gray-100
                      prose-table:border-gray-200 dark:prose-table:border-gray-700
                      prose-th:bg-gray-100 dark:prose-th:bg-gray-800
                      prose-img:rounded-lg prose-img:shadow-md
                      leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: articleContent }}
                  />
                ) : (
                  articleContent.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-gray-800 dark:text-gray-200 leading-[1.8] mb-5 text-[15px] sm:text-[17px] text-justify">
                      {paragraph}
                    </p>
                  ))
                )}
                <div className="clear-both" aria-hidden />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-gray-200 dark:border-gray-800 mb-8">
                <Tag size={13} className="text-gray-400 dark:text-gray-500" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom Ad - Responsive */}
              <div className="mb-8">
                <ResponsiveAdBanner desktopSlot="article_bottom" mobileSlot="article_bottom_mobile" />
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full" />
                    Related Stories
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map((r) => (
                      <ArticleCard key={r.id} article={r} variant="standard" />
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* More from category */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  More in{" "}
                  <span style={{ color: catColor }}>{article.category.name}</span>
                </h3>
                <div className="space-y-0">
                  {related.slice(0, 5).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </div>

              {/* Sticky sidebar */}
              <div className="lg:sticky lg:top-16 space-y-6">
                <LiveAdBannerWrapper slot="article_sidebar" />

                {/* Tourism promo */}
                <Link
                  href="/tourism"
                  className="block bg-gradient-to-br from-gray-950 to-red-950 rounded-xl p-5 text-white hover:from-gray-900 hover:to-red-900 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1 relative">Explore Uganda</p>
                  <p className="font-black text-base leading-snug relative">Discover safaris, lodges & experiences</p>
                  <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors relative">Browse tourism listings →</p>
                </Link>

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
              </div>
            </aside>
          </div>
        </div>

        <FooterWrapper />
      </div>
    </>
  );
}
