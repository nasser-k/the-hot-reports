"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getStoryGenres } from "@/lib/api";
import type { StoryGenreInfo } from "@/data/data";

export default function StoriesCTA() {
  const [genres, setGenres] = useState<StoryGenreInfo[]>([]);

  useEffect(() => {
    getStoryGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  return (
    <section className="bg-gradient-to-r from-gray-900 to-red-950 py-12 sm:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          {/* Text Content */}
          <div className="md:max-w-xl lg:max-w-2xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-3">
              Discover <span className="text-red-400">Stories</span>
            </h2>
            <p className="text-sm sm:text-base text-white/70 mb-4">
              Serial tales from talented writers. Explore genres from Kigezi.
            </p>

            {/* Genres from API */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 5).map((genre) => (
                  <Link
                    key={genre.value}
                    href={`/stories?genre=${genre.value}`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-sm rounded-full transition-colors"
                  >
                    {genre.label}
                  </Link>
                ))}
                {genres.length > 5 && (
                  <Link
                    href="/stories"
                    className="px-3 py-1.5 text-white/60 text-sm hover:text-white transition-colors"
                  >
                    +{genres.length - 5} more
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 md:text-right">
            <Link
              href="/stories"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              Explore Stories
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
