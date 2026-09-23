"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listStorySeries } from "@/lib/api";
import type { StorySeries, StoryGenreInfo } from "@/data/data";
import ClientPagination from "@/components/ClientPagination";
import { FileText, User, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { hasImage } from "@/lib/media";
import LiveAdBanner from "@/components/LiveAdBanner";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";

// Genre colors
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

interface StoryCardProps {
  story: StorySeries;
  genres: StoryGenreInfo[];
  index?: number;
}

function StoryCard({ story, genres, index = 0 }: StoryCardProps) {
  const genreInfo = genres.find((g) => g.value === story.genre) || { value: story.genre, label: story.genre, description: "" };
  const genreColor = getGenreColor(story.genre);
  const isTrending = story.totalEpisodes > 10;
  const showCover = hasImage(story.coverImage);
  // Eager load first 4 story images (above the fold)
  const isEager = index < 4;

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300"
    >
      {showCover ? (
        // Card with image - fixed height to match text cards
        <div className="relative h-[320px] sm:h-[360px] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={story.coverImage!}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading={isEager ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          {/* Badges - grouped together and aligned right */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap justify-end gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${genreColor} text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg`}>
              {genreInfo.label}
            </span>
            {story.status === "ongoing" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-soft-blink" />
                Ongoing
              </span>
            )}
            {story.status === "completed" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                Completed
              </span>
            )}
            {isTrending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-300" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-red-200 transition-colors mb-2">
              {story.title}
            </h3>

            <p className="text-xs sm:text-sm text-white/70 line-clamp-2 mb-3 hidden sm:block">
              {story.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {story.author.avatar ? (
                    <Image src={story.author.avatar} alt={story.author.name} width={24} height={24} className="object-cover" />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">
                  {story.author.name}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-white/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-semibold">{story.totalEpisodes}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Card without image - text only with fixed height
        <div className="flex flex-col h-[320px] sm:h-[360px] p-6">
          {/* Badges - aligned right to match image cards */}
          <div className="flex flex-wrap justify-end gap-3 mb-4">
            <span className={`px-2.5 py-1 ${genreColor} text-white text-[10px] font-bold uppercase tracking-wider rounded-lg`}>
              {genreInfo.label}
            </span>
            {story.status === "ongoing" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-soft-blink" />
                Ongoing
              </span>
            )}
            {story.status === "completed" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                Completed
              </span>
            )}
            {isTrending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
          </div>

          {/* Content */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors mb-3">
            {story.title}
          </h3>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3 mb-5 flex-1 leading-relaxed">
            {story.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {story.author.avatar ? (
                  <Image src={story.author.avatar} alt={story.author.name} width={28} height={28} className="object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {story.author.name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-semibold">{story.totalEpisodes}</span>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

interface StoriesGridProps {
  initialStories: StorySeries[];
  initialTotalPages: number;
  initialTotalCount: number;
  genres: StoryGenreInfo[];
  selectedGenre?: string;
  searchQuery?: string;
  storiesPerPage: number;
}

export default function StoriesGrid({
  initialStories,
  initialTotalPages,
  initialTotalCount,
  genres,
  selectedGenre,
  searchQuery,
  storiesPerPage,
}: StoriesGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stories, setStories] = useState<StorySeries[]>(initialStories);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch new stories when page changes
  const fetchStories = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      // On first page without genre/search filters, fetch +1 story for hero
      const apiPageSize = !selectedGenre && !searchQuery && page === 1 
        ? storiesPerPage + 1 
        : storiesPerPage;
      
      const res = await listStorySeries({
        genre: selectedGenre,
        search: searchQuery,
        page: page,
        pageSize: apiPageSize,
      });
      
      setStories(res.results);
      setTotalPages(res.totalPages);
      setTotalCount(res.count);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre, searchQuery, storiesPerPage]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    // Update URL with shallow routing (no page reload)
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl, { scroll: false });
    
  }, [router, searchParams]);

  // Fetch when page changes via URL
  useEffect(() => {
    fetchStories(currentPage);
  }, [currentPage, fetchStories]);

  // Calculate hero story for first page (only when no genre/search filters)
  const heroStory = !selectedGenre && !searchQuery && currentPage === 1
    ? stories.find((s) => s.isFeatured) ?? stories[0] ?? null
    : null;
  
  const remainingStories = heroStory
    ? stories.filter((s) => s.id !== heroStory.id)
    : stories;

  return (
    <div id="stories-grid">
      {/* Section Title */}
      {selectedGenre && (
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          All Stories
        </h2>
      )}
      {!selectedGenre && heroStory && (
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-600" />
          More Stories
        </h2>
      )}

      {/* Stories Grid */}
      {stories.length > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch ${isLoading ? "opacity-50" : ""}`}>
          {remainingStories.map((story, index) => (
            <div key={story.id} className="contents">
              <StoryCard story={story} genres={genres} index={index} />
              {/* Inline ad after 2nd story card */}
              {index === 1 && (
                <div className="col-span-1 sm:col-span-2 my-4">
                  <ResponsiveAdBanner desktopSlot="stories_mid" mobileSlot="stories_mid_mobile" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
              <FileText size={36} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No stories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
              {selectedGenre
                ? "No stories in this genre yet. Check back soon!"
                : "No stories available yet. Check back soon for new content!"}
            </p>
          </div>
        </div>
      )}

      {/* Pagination - show when more than 4 stories total */}
      {totalCount > storiesPerPage && (
        <div className="mt-8">
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
