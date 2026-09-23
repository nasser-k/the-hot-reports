import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTourismBySlug, listTourism, isApiNotFound } from "@/lib/api";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import { hasImage } from "@/lib/media";
import ViewportLiveAd from "@/components/ViewportLiveAd";
import { getAd } from "@/lib/ads";
import ShareButton from "@/components/ShareButton";
import RelatedListingsGrid from "./RelatedListingsGrid";
import { Star, MapPin, Phone, Globe, ArrowLeft, Compass, Share2 } from "lucide-react";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

// Revalidate every 5 minutes for fresh content
export const revalidate = 300;

const typeLabels: Record<string, string> = {
  safari: "Safari",
  lodge: "Lodge",
  hotel: "Hotel",
  campsite: "Campsite",
  experience: "Experience",
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com";

  try {
    const listing = await getTourismBySlug(slug);

    const title = listing.metaTitle || `${listing.name} | ${typeLabels[listing.type] || "Tourism"} in Uganda`;
    const description = listing.metaDescription || listing.tagline || `Explore ${listing.name} in Uganda, Uganda. ${listing.description?.substring(0, 150)}...`;
    const keywords = listing.metaKeywords || `${listing.name}, ${listing.type}, Uganda tourism, Uganda travel, ${listing.location}`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: "article",
        url: `${siteUrl}/tourism/${slug}`,
        images: [
          {
            url: listing.image,
            width: 1200,
            height: 630,
            alt: listing.name,
          },
        ],
        locale: "en_US",
        siteName: "The Hot Reports",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [listing.image],
      },
      alternates: {
        canonical: `${siteUrl}/tourism/${slug}`,
      },
    };
  } catch {
    return {
      title: "Tourism Listing | The Hot Reports",
      description: "Discover amazing tourism experiences in Uganda, Uganda.",
    };
  }
}

export default async function TourismDetailPage({ params }: Props) {
  const { slug } = await params;
  let listing;
  try {
    listing = await getTourismBySlug(slug);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }

  const typeLabel = typeLabels[listing.type] || "Tourism";

  // Check if description is HTML (contains HTML tags)
  const descriptionHtml = listing.description || "";
  const isHtml = /<(br|p|div|span|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|img|blockquote|code|pre)[^>]*>/i.test(descriptionHtml);
  const listingsPerPage = 9;

  // Get related listings (same type, excluding current) for pagination
  let relatedListings: typeof listing[] = [];
  let allRelatedListings: { count: number; results: typeof listing[] } | null = null;
  try {
    allRelatedListings = await listTourism({ page: 1, pageSize: 100 });
    relatedListings = allRelatedListings.results
      .filter((l) => l.type === listing.type && l.slug !== listing.slug)
      .slice(0, listingsPerPage);
  } catch {
    relatedListings = [];
    allRelatedListings = null;
  }

  // Prefetch sidebar ad for ViewportLiveAd components
  const sidebarAd = await getAd("tourism_sidebar").catch(() => ({ ad: null }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavbarWrapper />

      {/* Hero */}
      <figure className="relative h-[50vh] sm:h-[60vh]">
        <Image
          src={listing.image}
          alt={listing.name}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-[1400px] mx-auto">
            <Link
              href="/tourism"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Tourism
            </Link>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                {typeLabel}
              </span>
              {listing.featured && (
                <span className="px-2.5 py-1 bg-yellow-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">
              {listing.name}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl">
              {listing.tagline}
            </p>
          </div>
        </div>
      </figure>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-12">
        {/* Top Ad - Responsive */}
        <div className="mb-6">
          <ResponsiveAdBanner desktopSlot="tourism_top" mobileSlot="tourism_top_mobile" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 mb-8 break-words">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                About
              </h2>
              {isHtml ? (
                <div
                  className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-justify break-words mb-6
                    prose-p:text-gray-600 dark:prose-p:text-gray-400
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-a:text-red-600 hover:prose-a:text-red-700
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-blockquote:border-l-red-600 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900/50
                    prose-code:text-red-600 prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                    prose-pre:bg-gray-900 prose-pre:text-gray-100
                    prose-table:border-gray-200 dark:prose-table:border-gray-700
                    prose-th:bg-gray-100 dark:prose-th:bg-gray-800
                    prose-img:rounded-lg prose-img:shadow-md
                    leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-justify mb-6">
                  {listing.description}
                </p>
              )}

              {/* Share buttons */}
              <div className="flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">Share</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com"}/tourism/${listing.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com"}/tourism/${listing.slug}`)}&text=${encodeURIComponent(`Check out ${listing.name} in Uganda!`)}`}
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
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${listing.name} in Uganda! ${process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com"}/tourism/${listing.slug}`)}`}
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
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com"}/tourism/${listing.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:bg-[#0958a8] transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <ShareButton
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com"}/tourism/${listing.slug}`}
                  title={listing.name}
                  text={`Check out ${listing.name} in Uganda!`}
                />
              </div>
            </div>

            {/* Rating & Info - Responsive grid below description */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Rating */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{listing.rating}/5.0</p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{listing.location}</p>
                </div>

                {/* Price */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.priceRange}</p>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-1">
                  {listing.phone && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <a href={`tel:${listing.phone}`} className="text-sm text-gray-900 dark:text-white hover:underline">
                        {listing.phone}
                      </a>
                    </div>
                  )}
                  {listing.website && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                      <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 dark:text-white hover:underline break-all block">
                        {listing.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ViewportLiveAd slot="tourism_sidebar" showWhen="max-lg" className="my-8" initialAdData={sidebarAd} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {listing.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ViewportLiveAd slot="tourism_sidebar" showWhen="min-lg" initialAdData={sidebarAd} />
          </div>
        </div>
      </div>

      {/* Related Listings - Full Width Section */}
      <div className="w-full bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <RelatedListingsGrid
            initialListings={relatedListings}
            initialTotalPages={Math.ceil((allRelatedListings?.count || 0) / 9)}
            initialTotalCount={allRelatedListings?.count || 0}
            listingType={listing.type}
            excludeSlug={slug}
            listingsPerPage={9}
            typeLabel={typeLabel}
          />
        </div>
      </div>

      <FooterWrapper />
    </div>
  );
}
