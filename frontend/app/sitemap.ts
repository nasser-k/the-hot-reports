import { MetadataRoute } from "next";
import { listArticles, listTourism, listStorySeries } from "@/lib/api";
import { NEWS_CATEGORIES } from "@/lib/categories";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com";

export const revalidate = 3600; // Regenerate sitemap every hour

// Static pages that always exist even if backend is offline
const staticPages: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 1,
  },
  {
    url: `${BASE_URL}/stories`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/tourism`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/search`,
    lastModified: new Date(),
    changeFrequency: "always",
    priority: 0.5,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Try to fetch dynamic content, but fall back to static pages if server is offline
  try {
    // Fetch all data in parallel with timeout
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

    const [articles, tourism, storySeries] = await Promise.race([
      Promise.all([
        listArticles({ page: 1, pageSize: 500 }).catch(() => ({ count: 0, results: [] })),
        listTourism({ page: 1, pageSize: 100 }).catch(() => ({ count: 0, results: [] })),
        listStorySeries({ page: 1, pageSize: 500 }).catch(() => ({ count: 0, results: [] })),
      ]),
      timeout(5000), // 5 second timeout
    ]) as [any, any, any];

    // Build dynamic pages only if we got data
    const categoryPages: MetadataRoute.Sitemap = NEWS_CATEGORIES.map((cat) => ({
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    const articlePages: MetadataRoute.Sitemap = (articles?.results || []).map((article: any) => ({
      url: `${BASE_URL}/article/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const tourismPages: MetadataRoute.Sitemap = (tourism?.results || []).map((listing: any) => ({
      url: `${BASE_URL}/tourism/${listing.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const storySeriesPages: MetadataRoute.Sitemap = (storySeries?.results || []).map((series: any) => ({
      url: `${BASE_URL}/stories/${series.slug}`,
      lastModified: new Date(series.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    // Fetch episodes for each series (limited to avoid timeout)
    let storyEpisodePages: MetadataRoute.Sitemap = [];
    const { getStorySeriesBySlug } = await import("@/lib/api");

    for (const series of (storySeries?.results || []).slice(0, 10)) {
      try {
        const seriesWithEpisodes = await Promise.race([
          getStorySeriesBySlug(series.slug),
          timeout(2000),
        ]) as any;

        if (seriesWithEpisodes?.episodes?.length > 0) {
          for (const episode of seriesWithEpisodes.episodes) {
            storyEpisodePages.push({
              url: `${BASE_URL}/stories/episode/${episode.slug}`,
              lastModified: new Date(episode.publishedAt),
              changeFrequency: "weekly" as const,
              priority: 0.8,
            });
          }
        }
      } catch {
        // Skip episodes for this series on error
        continue;
      }
    }

    return [
      ...staticPages,
      ...categoryPages,
      ...articlePages,
      ...tourismPages,
      ...storySeriesPages,
      ...storyEpisodePages,
    ];
  } catch (error) {
    // Server is offline or error occurred - return only static pages
    console.warn('Sitemap: Backend unavailable, serving static pages only');
    return staticPages;
  }
}
