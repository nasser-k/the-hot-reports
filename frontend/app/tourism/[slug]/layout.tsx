import { Metadata } from "next";
import { getTourismBySlug, getSiteSettingsWithFallback } from "@/lib/api";
import { hasImage } from "@/lib/media";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [listing, settings] = await Promise.all([
    getTourismBySlug(slug).catch(() => null),
    getSiteSettingsWithFallback(),
  ]);

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  const seoTitle = listing.metaTitle || listing.name;
  const seoDescription = listing.metaDescription || listing.tagline;
  const seoKeywords = listing.metaKeywords
    ? listing.metaKeywords.split(",").map((k) => k.trim())
    : listing.tags;

  return {
    title: `${seoTitle} - Tourism | ${settings.siteName}`,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `${settings.siteUrl}/tourism/${listing.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website",
      images: hasImage(listing.image)
        ? [{ url: listing.image!, width: 1200, height: 630, alt: listing.name }]
        : undefined,
      siteName: settings.siteName,
      locale: "en_UG",
    },
    twitter: {
      card: hasImage(listing.image) ? "summary_large_image" : "summary",
      title: seoTitle,
      description: seoDescription,
      images: hasImage(listing.image) ? [listing.image!] : undefined,
      site: settings.twitterHandle,
    },
  };
}

export default function TourismLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
