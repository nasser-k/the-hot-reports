import { Metadata } from "next";
import { getStorySeriesBySlug, getSiteSettingsWithFallback } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [series, settings] = await Promise.all([
    getStorySeriesBySlug(slug).catch(() => null),
    getSiteSettingsWithFallback(),
  ]);

  if (!series) {
    return { title: "Story Series Not Found" };
  }

  const seoTitle = series.metaTitle || series.title;
  const seoDescription = series.metaDescription || series.subtitle || series.description || `Read ${series.title} on ${settings.siteName}`;
  const seoKeywords = [series.genre, "serial stories", "African stories", "fiction", series.title, series.author?.name].filter(Boolean) as string[];

  return {
    title: `${seoTitle} - Serial Stories | ${settings.siteName}`,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `${settings.siteUrl}/stories/${series.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "article",
      locale: "en_UG",
      url: `${settings.siteUrl}/stories/${slug}`,
      siteName: settings.siteName,
      publishedTime: series.publishedAt ?? undefined,
      tags: seoKeywords,
      images: series.coverImage
        ? [{ url: series.coverImage, width: 1200, height: 630, alt: seoTitle }]
        : undefined,
    },
    twitter: {
      card: series.coverImage ? "summary_large_image" : "summary",
      title: seoTitle,
      description: seoDescription,
      images: series.coverImage ? [series.coverImage] : [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function StorySeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
