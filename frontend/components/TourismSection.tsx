import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowRight, Compass } from "lucide-react";
import { listTourism } from "@/lib/api";
import EmptyState, { TourismCardSkeleton } from "./EmptyState";
import type { TourismListing } from "@/data/data";
import { hasImage } from "@/lib/media";

// Skeleton for tourism section
function TourismSectionSkeleton() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-red-950">
      <div className="relative max-w-[1400px] mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <div className="w-5 h-5 bg-gray-700 rounded" />
          <div className="h-4 bg-gray-700 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <TourismCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function TourismContent() {
  let featured: TourismListing[] = [];
  let hasError = false;
  try {
    const res = await listTourism({ featured: true, pageSize: 10 });
    featured = res.results;
  } catch {
    hasError = true;
    featured = [];
  }

  // Show empty state when no featured listings
  if (featured.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950" />
        <div className="relative max-w-[1400px] mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-6">
            <Compass size={20} className="text-red-400" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Explore Uganda</span>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/[0.08]">
            <EmptyState variant={hasError ? "error" : "tourism"} />
          </div>
          {/* Keep the CTA banner even when empty */}
          <div className="mt-8 bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm">Want your tourism business featured here?</p>
              <p className="text-gray-400 text-xs mt-0.5">Reach thousands of visitors exploring Uganda</p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full transition-colors whitespace-nowrap"
            >
              Advertise With Us
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background - site brand colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950" />

      <div className="relative max-w-[1400px] mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass size={20} className="text-red-400" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Explore Uganda</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Tourism & Travel
            </h2>
            <p className="text-gray-300 text-sm mt-1 max-w-lg">
              Discover the Switzerland of Africa - gorilla safaris, stunning lakes, volcanic mountains, and rich Bakiga culture.
            </p>
          </div>
          <Link
            href="/tourism"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-full transition-all hover:gap-3 whitespace-nowrap"
          >
            View All Listings <ArrowRight size={14} />
          </Link>
        </div>

        {/* Featured listings grid - responsive: 1/2/3/4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featured.map((listing) => (
            <Link
              key={listing.id}
              href={`/tourism?type=${listing.type}`}
              className="group bg-white/[0.06] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              {hasImage(listing.image) ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={listing.image!}
                    alt={listing.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-[11px] font-semibold">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    {listing.rating}
                  </div>
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                    {listing.type}
                  </span>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
                  <span className="px-2 py-0.5 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-2">
                    {listing.type}
                  </span>
                  <div className="flex items-center gap-1 text-white text-[11px] font-semibold">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    {listing.rating}
                  </div>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
                  {listing.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-1 line-clamp-2">
                  {listing.tagline}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08]">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin size={10} />
                    {listing.location.split(",")[0]}
                  </span>
                  <span className="text-[11px] font-semibold text-white">
                    {listing.priceRange.split("–")[0]}+
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-6 sm:mt-8 bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.08] px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-white font-bold text-sm">Want your tourism business featured here?</p>
            <p className="text-gray-500 text-xs mt-0.5">Reach thousands of visitors exploring Uganda</p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full transition-colors whitespace-nowrap"
          >
            Advertise With Us
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main export with Suspense boundary
export default function TourismSection() {
  return (
    <Suspense fallback={<TourismSectionSkeleton />}>
      <TourismContent />
    </Suspense>
  );
}
