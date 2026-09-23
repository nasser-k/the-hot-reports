import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ChevronRight,
  Clock,
  PlayCircle,
  Feather,
} from "lucide-react";
import { getStorySeriesBySlug, getStoryGenres, getSiteSettingsWithFallback, isApiNotFound } from "@/lib/api";
import { hasImage } from "@/lib/media";
import type { StorySeriesWithEpisodes, StoryEpisodeListItem } from "@/data/data";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import ShareButton from "@/components/ShareButton";

export const revalidate = 300; // Revalidate every 5 minutes for fresh content

interface Props {
  params: Promise<{ slug: string }>;
}

const GENRE_COLORS = [
  "bg-green-600", "bg-blue-600", "bg-orange-600", "bg-amber-600",
  "bg-teal-600", "bg-red-600", "bg-purple-600", "bg-pink-600",
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  ongoing: "bg-green-500",
  completed: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  ongoing: "Ongoing",
  completed: "Completed",
};

function getGenreColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GENRE_COLORS[Math.abs(hash) % GENRE_COLORS.length];
}

function EpisodeCard({
  episode,
  seriesSlug,
}: {
  episode: StoryEpisodeListItem;
  seriesSlug: string;
}) {
  return (
    <Link
      href={`/stories/episode/${episode.slug}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300"
    >
      {hasImage(episode.image) ? (
        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          <Image
            src={episode.image!}
            alt={episode.title}
            fill
            sizes="64px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <span className="font-black text-red-600">{episode.episodeNumber}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-1">
          {episode.title}
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 text-justify">
          {episode.excerpt}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {episode.readTimeMinutes} min read
          </span>
        </div>
      </div>
      <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
    </Link>
  );
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;

  let series: StorySeriesWithEpisodes | null = null;
  let genres = [];
  let settings;
  try {
    [series, genres, settings] = await Promise.all([
      getStorySeriesBySlug(slug),
      getStoryGenres(),
      getSiteSettingsWithFallback(),
    ]);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }

  if (!series) notFound();

  const genreInfo = genres.find((g) => g.value === series.genre) || { value: series.genre, label: series.genre, description: "" };
  const genreColor = getGenreColor(series.genre);
  const statusColor = STATUS_COLORS[series.status] || "bg-gray-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavbarWrapper />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/stories" className="flex items-center gap-1 hover:text-red-600 transition-colors">
            <Feather size={14} />
            Stories
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-400">{series.title}</span>
        </nav>

        {/* Top Ad - Responsive */}
        <div className="mb-6">
          <ResponsiveAdBanner desktopSlot="story_top" mobileSlot="story_top_mobile" />
        </div>

        {/* Story Header - Featured Card Style */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-950">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
          <div className={`grid gap-0 ${series.coverImage ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
            {/* Image Side - Only if image exists */}
            {series.coverImage && (
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px]">
                <Image
                  src={series.coverImage}
                  alt={series.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/90 lg:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent lg:hidden" />
                {/* Genre Badge - top left on image */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${genreColor}`}>
                    {genreInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* Content Side */}
            <div className={`relative p-6 sm:p-8 lg:p-12 flex flex-col justify-center ${!series.coverImage ? 'text-center items-center' : ''}`}>
              {/* Genre Badge (when no image) */}
              {!series.coverImage && (
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${genreColor}`}>
                    {genreInfo.label}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-white text-xs font-bold uppercase tracking-wider rounded-full ${series.status === 'ongoing' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {series.status === 'ongoing' && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  {STATUS_LABELS[series.status] || series.status}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
                {series.title}
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-white/70 mb-6 line-clamp-3 leading-relaxed text-justify">
                {series.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {series.totalEpisodes} Episodes
                </span>
                {series.status === "ongoing" && (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Ongoing Series
                  </span>
                )}
              </div>

              {/* Share Buttons */}
            {settings && (
              <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-white/20">
                <span className="text-sm text-white/60">Share:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${settings.siteUrl}/stories/${series.slug}`)}`}
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
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${settings.siteUrl}/stories/${series.slug}`)}&text=${encodeURIComponent(`Read "${series.title}" on ${settings.siteName}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                  aria-label="Share on X"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Read "${series.title}" on ${settings.siteName} ${settings.siteUrl}/stories/${series.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#22c35e] transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347-.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${settings.siteUrl}/stories/${series.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:bg-[#0958a8] transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <ShareButton
                  url={`${settings.siteUrl}/stories/${series.slug}`}
                  title={series.title}
                  text={series.socialSnippet || `Read "${series.title}" on ${settings.siteName}`}
                />
              </div>
            )}
            {/* End Content Side */}
          </div>
          {/* End Grid */}
        </div>
        {/* End Featured Card */}
        </div>

        {/* Episodes List */}
        <div className="pt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-600" />
                Episodes ({series.episodes.length})
              </h2>

              {series.episodes.length > 0 ? (
                <div className="space-y-3">
                  {series.episodes.map((episode) => (
                    <EpisodeCard key={episode.id} episode={episode} seriesSlug={series.slug} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No episodes published yet.</p>
              )}
            </div>

          {/* Mid Ad - Responsive */}
          <div className="my-6">
            <ResponsiveAdBanner desktopSlot="story_mid" mobileSlot="story_mid_mobile" />
          </div>
      </main>

      <FooterWrapper />
    </div>
  );
}
