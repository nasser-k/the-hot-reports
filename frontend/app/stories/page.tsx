import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Feather, Sparkles, User, ArrowRight, ArrowLeft } from "lucide-react";
import { listStorySeries, getStoryGenres } from "@/lib/api";
import type { StorySeries, StoryGenreInfo } from "@/data/data";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import LiveAdBannerWrapper from "@/components/LiveAdBannerWrapper";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import SearchFilter from "./SearchFilter";
import StoriesGrid from "./StoriesGrid";
import { hasImage } from "@/lib/media";

export const revalidate = 300; // Revalidate every 5 minutes for fresh content

interface Props {
  searchParams: Promise<{ genre?: string; search?: string; page?: string }>;
}

// Dynamic genre color mapping
const GENRE_COLORS = [
  "bg-green-600", "bg-blue-600", "bg-orange-600", "bg-amber-600",
  "bg-teal-600", "bg-red-600", "bg-purple-600", "bg-pink-600",
];

function getGenreColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GENRE_COLORS[Math.abs(hash) % GENRE_COLORS.length];
}

// Featured Story Hero Component
function FeaturedStory({ story, genreInfo, isLatestFallback }: { story: StorySeries; genreInfo: StoryGenreInfo; isLatestFallback?: boolean }) {
  const showCover = hasImage(story.coverImage);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-950">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
      <div className={`grid gap-0 ${showCover ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {/* Image Side - Only if image exists */}
        {showCover && (
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px]">
            <Image
              src={story.coverImage!}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/90 lg:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent lg:hidden" />
          </div>
        )}

        {/* Content Side */}
        <div className={`relative p-6 sm:p-8 lg:p-12 flex flex-col justify-center ${!hasImage ? 'text-center items-center' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-white text-xs font-bold uppercase tracking-wider rounded-full ${isLatestFallback ? 'bg-blue-500' : 'bg-red-500'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              {isLatestFallback ? 'Latest Story' : 'Featured Story'}
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium rounded-full">
              {genreInfo.label}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
            {story.title}
          </h2>

          <p className="text-base sm:text-lg text-white/70 mb-6 line-clamp-3 leading-relaxed">
            {story.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {story.author.name}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {story.totalEpisodes} Episodes
            </span>
            {story.status === "ongoing" && (
              <span className="flex items-center gap-1.5 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-soft-blink" />
                Ongoing
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href={`/stories/${story.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Reading
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function StoriesPage({ searchParams }: Props) {
  const { genre: selectedGenre, search: searchQuery, page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const storiesPerPage = 4;
  // On first page without filters, fetch 5 stories so featured story can be removed from grid leaving 4
  const apiPageSize = !selectedGenre && !searchQuery && currentPage === 1 
    ? storiesPerPage + 1 
    : storiesPerPage;

  // Fetch stories and genres from backend with pagination
  let stories: StorySeries[] = [];
  let genres: StoryGenreInfo[] = [];
  let totalPages = 1;
  let totalCount = 0;
  
  try {
    const [storiesRes, genresRes] = await Promise.all([
      listStorySeries({ 
        genre: selectedGenre, 
        search: searchQuery,
        page: currentPage, 
        pageSize: apiPageSize 
      }),
      getStoryGenres(),
    ]);
    stories = storiesRes.results;
    totalPages = storiesRes.totalPages;
    totalCount = storiesRes.count;
    genres = genresRes;
  } catch {
    // Fallback to empty arrays on error
  }

  // Find explicit featured story or fallback to latest (only on first page, no genre/search)
  const explicitFeatured = !selectedGenre && !searchQuery && currentPage === 1
    ? stories.find((s) => s.isFeatured) ?? null
    : null;
  const latestStory = !selectedGenre && !searchQuery && !explicitFeatured && currentPage === 1
    ? stories[0] ?? null
    : null;
  const heroStory = explicitFeatured || latestStory;
  const remainingStories = heroStory
    ? stories.filter((s) => s.id !== heroStory.id)
    : stories;

  const activeGenre = selectedGenre ? genres.find((g) => g.value === selectedGenre) ?? null : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavbarWrapper />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-semibold">Stories</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-500">
              <Feather className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {activeGenre ? activeGenre.label : "Stories"}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {activeGenre
              ? (activeGenre.description || `Browse our collection of ${activeGenre.label} stories from talented writers.`)
              : "Serial tales from talented writers across Uganda and beyond. Follow gripping multi-episode stories that keep you coming back for every new chapter."}
          </p>
        </div>

        {/* Featured Story Hero */}
        {heroStory && !selectedGenre && !searchQuery && (
          <div className="mb-10">
            <FeaturedStory
              story={heroStory}
              genreInfo={genres.find((g) => g.value === heroStory.genre) || { value: heroStory.genre, label: heroStory.genre, description: "" }}
              isLatestFallback={!!latestStory && !explicitFeatured}
            />
          </div>
        )}

        {/* Top Ad - Responsive */}
        <div className="mb-8">
          <ResponsiveAdBanner desktopSlot="stories_top" mobileSlot="stories_top_mobile" />
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilter
            genres={genres}
            selectedGenre={selectedGenre}
            initialSearch={searchQuery || ""}
          />
        </div>

        {/* Stories Grid - Full Width */}
        <StoriesGrid
          initialStories={stories}
          initialTotalPages={totalPages}
          initialTotalCount={totalCount}
          genres={genres}
          selectedGenre={selectedGenre}
          searchQuery={searchQuery}
          storiesPerPage={storiesPerPage}
        />
      </main>

      <FooterWrapper />
    </div>
  );
}
