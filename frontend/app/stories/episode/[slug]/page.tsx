import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Feather,
  TrendingUp,
} from "lucide-react";
import { getStoryEpisodeBySlug, getSiteSettingsWithFallback, isApiNotFound } from "@/lib/api";
import type { StoryEpisode } from "@/data/data";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import InlineContentImage from "@/components/InlineContentImage";
import TrackStoryView from "@/components/TrackStoryView";
import EngagementSection from "./EngagementSection";
import CommentSection from "./CommentSection";

export const revalidate = 300; // Revalidate every 5 minutes for fresh content

interface Props {
  params: Promise<{ slug: string }>;
}

function EpisodeBody({
  content,
  image,
  imageAlt,
  imageAttribution,
}: {
  content: string;
  image?: string;
  imageAlt: string;
  imageAttribution?: string;
}) {
  const trimmed = content.trim();
  const inlineImage = image ? (
    <>
      <InlineContentImage src={image} alt={imageAlt} priority />
      {imageAttribution && (
        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 italic text-center sm:text-left mb-4">
          {imageAttribution}
        </p>
      )}
    </>
  ) : null;
  // Check if content is HTML (contains HTML tags)
  const isHtml = /<(br|p|div|span|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|img|blockquote|code|pre)[^>]*>/i.test(trimmed);

  if (isHtml) {
    return (
      <div className="max-w-none mb-8 min-w-0 break-words">
        {inlineImage}
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
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
        <div className="clear-both" aria-hidden />
      </div>
    );
  }

  const paragraphs = trimmed.split(/\n\n+/).filter((p) => p.trim());
  return (
    <div className="max-w-none mb-8 min-w-0">
      {inlineImage}
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className="text-gray-800 dark:text-gray-200 leading-[1.8] mb-5 text-[15px] sm:text-[17px] text-justify break-words"
        >
          {paragraph}
        </p>
      ))}
      <div className="clear-both" aria-hidden />
    </div>
  );
}

function EpisodeNav({
  episode,
}: {
  episode: StoryEpisode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-6 border-t border-gray-200 dark:border-gray-800">
      <div className="min-w-0">
        {episode.previousEpisode ? (
          <Link
            href={`/stories/episode/${episode.previousEpisode.slug}`}
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors min-w-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-left min-w-0">
              <span className="text-xs text-gray-500">Previous Episode</span>
              <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-red-600 line-clamp-2 break-words">
                Ep {episode.previousEpisode.episodeNumber}: {episode.previousEpisode.title}
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href={`/stories/${episode.series.slug}`}
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors min-w-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-red-600 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-red-600">
              Back to Series
            </span>
          </Link>
        )}
      </div>

      <div className="min-w-0 sm:text-right">
        {episode.nextEpisode ? (
          <Link
            href={`/stories/episode/${episode.nextEpisode.slug}`}
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-w-0 sm:flex-row-reverse"
          >
            <ChevronRight className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-left sm:text-right min-w-0 flex-1">
              <span className="text-xs text-red-600 font-medium">Next Episode</span>
              <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-red-600 line-clamp-2 break-words">
                Ep {episode.nextEpisode.episodeNumber}: {episode.nextEpisode.title}
              </p>
            </div>
          </Link>
        ) : episode.isLastPublishedEpisode ? (
          <div className="p-3 text-left sm:text-right">
            <span className="text-xs text-orange-500 font-medium">Coming Soon</span>
            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
              Next episode coming soon!
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params;

  let episode: StoryEpisode | null = null;
  let settings;
  try {
    [episode, settings] = await Promise.all([
      getStoryEpisodeBySlug(slug),
      getSiteSettingsWithFallback(),
    ]);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }

  if (!episode) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      <NavbarWrapper />
      <TrackStoryView slug={slug} />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap min-w-0">
          <Link href="/stories" className="flex items-center gap-1 hover:text-red-600 transition-colors whitespace-nowrap">
            <Feather size={14} />
            Stories
          </Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <Link
            href={`/stories/${episode.series.slug}`}
            className="hover:text-red-600 transition-colors truncate max-w-[min(12rem,45vw)] sm:max-w-xs min-w-0"
          >
            {episode.series.title}
          </Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <span className="text-gray-400 whitespace-nowrap">Episode {episode.episodeNumber}</span>
        </nav>

        {/* Top Ad - Responsive */}
        <div className="mb-6">
          <ResponsiveAdBanner desktopSlot="episode_top" mobileSlot="episode_top_mobile" />
        </div>

        {/* Episode Header */}
        <header className="mb-8 sm:mb-10 text-center min-w-0">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full">
            <span className="flex items-center gap-1 text-xs sm:text-sm text-red-600/70 whitespace-nowrap">
              <Clock size={14} />
              {episode.readTimeMinutes} min read
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-[1.15] break-words px-1">
            {episode.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto text-justify break-words px-1">
            {episode.excerpt}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {episode.likesCount > 50 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
          </div>
        </header>

        <EpisodeBody
          content={episode.content}
          image={episode.image}
          imageAlt={episode.title}
          imageAttribution={episode.imageAttribution}
        />

        {/* Engagement Section */}
        <EngagementSection
          episodeSlug={episode.slug}
          episodeTitle={episode.title}
          episodeExcerpt={episode.excerpt}
          initialLiked={episode.userLiked}
          initialLikesCount={episode.likesCount}
          initialCommentsCount={episode.commentsCount}
          siteUrl={settings.siteUrl}
          siteName={settings.siteName}
        />

        {/* Mid Ad - Responsive */}
        <div className="my-8">
          <ResponsiveAdBanner desktopSlot="episode_mid" mobileSlot="episode_mid_mobile" />
        </div>

        {/* Next Episode Teaser */}
        {!episode.nextEpisode && episode.nextEpisodeTeaser && (
          <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white mb-10 text-center min-w-0">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-4 opacity-80" />
            <h3 className="font-bold text-xl sm:text-2xl mb-3">What Happens Next?</h3>
            <p className="text-base sm:text-lg text-white/90 mb-2 max-w-2xl mx-auto break-words">
              {episode.nextEpisodeTeaser}
            </p>
            <p className="text-xs sm:text-sm text-white/70 mt-4">
              The next episode is coming soon. Stay tuned!
            </p>
          </div>
        )}

        <EpisodeNav episode={episode} />

        {/* Series Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          {/* Series Card */}
            <Link
              href={`/stories/${episode.series.slug}`}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:shadow-lg hover:border-red-200 dark:hover:border-red-800 transition-all group min-w-0"
            >
              {episode.series.coverImage ? (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                  <Image
                    src={episode.series.coverImage}
                    alt={episode.series.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">From series</p>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-1">
                  {episode.series.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Episode {episode.episodeNumber} of {episode.series.totalEpisodes}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
            </Link>

            {/* Author Info */}
            {episode.series.author && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 ring-2 ring-red-100 dark:ring-red-900/30">
                    {episode.series.author.avatar ? (
                      <Image
                        src={episode.series.author.avatar}
                        alt={episode.series.author.name || "Pulse Writer"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {(episode.series.author.name || "P").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Written by</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {episode.series.author.name || "Pulse Writer"}
                    </p>
                  </div>
                </div>
                {episode.series.author.bio && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {episode.series.author.bio}
                  </p>
                )}
              </div>
            )}

            {/* Comments Section */}
            <CommentSection comments={episode.comments} commentsCount={episode.commentsCount} />
        </div>
  </main>

  <FooterWrapper />
</div>
);
}
