import { Metadata } from "next";
import { getStoryEpisodeBySlug, getSiteSettingsWithFallback } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [episode, settings] = await Promise.all([
    getStoryEpisodeBySlug(slug).catch(() => null),
    getSiteSettingsWithFallback(),
  ]);

  if (!episode) {
    return { title: "Episode Not Found" };
  }

  const seoTitle = episode.metaTitle || episode.title;
  const seoDescription = episode.metaDescription || episode.excerpt || `Episode ${episode.episodeNumber} of ${episode.series.title}. Read on ${settings.siteName}.`;
  const seoKeywords = episode.metaKeywords
    ? episode.metaKeywords.split(",").map((k) => k.trim())
    : [episode.series.genre, "serial stories", "fiction", "episode", episode.series.title, episode.series.author?.name].filter(Boolean) as string[];

  return {
    title: `${seoTitle} - ${episode.series.title} | ${settings.siteName}`,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `${settings.siteUrl}/stories/episode/${episode.slug}`,
    },
    openGraph: {
      title: `${seoTitle} - ${episode.series.title}`,
      description: seoDescription,
      type: "article",
      locale: "en_UG",
      url: `${settings.siteUrl}/stories/episode/${slug}`,
      siteName: settings.siteName,
      publishedTime: episode.publishedAt,
      section: episode.series.title,
      tags: seoKeywords,
      images: episode.series.coverImage
        ? [{ url: episode.series.coverImage, width: 1200, height: 630, alt: seoTitle }]
        : undefined,
    },
    twitter: {
      card: episode.series.coverImage ? "summary_large_image" : "summary",
      title: `${seoTitle} - ${episode.series.title}`,
      description: seoDescription,
      images: episode.series.coverImage
        ? [episode.series.coverImage]
        : [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function StoryEpisodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
