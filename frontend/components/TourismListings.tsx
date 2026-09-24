"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Phone, ExternalLink, ArrowLeft, Compass, Hotel, TreePine, Tent, Mountain } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { TourismListing, TourismType } from "@/data/data";
import { listTourism } from "@/lib/api";
import LiveAdBanner from "@/components/LiveAdBanner";
import { ResponsiveAdBanner } from "@/components/ResponsiveAdBanner";
import { hasImage } from "@/lib/media";
import ClientPagination from "./ClientPagination";
import FilterSheet from "./FilterSheet";

const typeConfig: Record<TourismType, { label: string; icon: typeof Compass; color: string }> = {
  safari: { label: "Safaris", icon: Compass, color: "#059669" },
  lodge: { label: "Lodges", icon: TreePine, color: "#0D9488" },
  hotel: { label: "Hotels", icon: Hotel, color: "#2563EB" },
  campsite: { label: "Campsites", icon: Tent, color: "#D97706" },
  experience: { label: "Experiences", icon: Mountain, color: "#7C3AED" },
};

const allTypes = Object.keys(typeConfig) as TourismType[];

const listingsPerPage = 6;

export default function TourismListings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeType = searchParams.get("type") as TourismType | null;
  const validActive = activeType && allTypes.includes(activeType) ? activeType : null;
  const typesToShow = validActive ? [validActive] : allTypes;
  
  const [allListings, setAllListings] = useState<TourismListing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch listings with pagination
  const fetchListings = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await listTourism({ 
        page: page, 
        pageSize: listingsPerPage,
        type: validActive || undefined 
      });
      setAllListings(res.results);
      setTotalPages(res.totalPages);
      setTotalCount(res.count);
    } catch (error) {
      console.error("Failed to fetch tourism listings:", error);
      setAllListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [validActive]);

  useEffect(() => {
    fetchListings(currentPage);
  }, [currentPage, fetchListings]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl, { scroll: false });
    
  }, [router, searchParams]);

  return (
    <>
      {/* ── Header ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-semibold">Tourism</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-500">
              <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {validActive ? typeConfig[validActive].label : "Explore Uganda"}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {validActive
              ? `Browse our curated selection of ${typeConfig[validActive].label.toLowerCase()} in Uganda.`
              : "Safaris, lakes, cities, and lodges from every region of Uganda."}
          </p>

          {/* Filter Sheet */}
          <div className="relative mt-6">
            <FilterSheet
              options={allTypes.map(type => ({ 
                value: type, 
                label: typeConfig[type].label 
              }))}
              selectedValue={validActive}
              baseUrl="/tourism"
              title="Categories"
              paramName="type"
            />
          </div>
        </div>
      </div>

      {/* ── Ads ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <ResponsiveAdBanner desktopSlot="tourism_banner" mobileSlot="tourism_banner_mobile" />
      </div>

      {/* ── Listings ── */}
      <div id="tourism-listings" className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8 space-y-12 sm:space-y-16">
        {/* Type header when filtered */}
        {validActive && (
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: typeConfig[validActive].color + "15" }}
            >
              {(() => {
                const Icon = typeConfig[validActive].icon;
                return <Icon size={20} style={{ color: typeConfig[validActive].color }} />;
              })()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {typeConfig[validActive].label}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalCount} listing{totalCount !== 1 && "s"}
              </p>
            </div>
          </div>
        )}

        {allListings.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Compass size={32} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No Listings Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              We're currently building our tourism collection in Uganda. Check back soon for amazing options!
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors text-sm"
            >
              List Your Business
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${isLoading ? "opacity-50" : ""}`}>
              {allListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {hasImage(listing.image) ? (
                      <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                        <Image
                          src={listing.image!}
                          alt={listing.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="eager"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {listing.rating}
                        </div>
                        {listing.featured && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
                        {listing.featured && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-2">
                            Featured
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-gray-900 dark:text-white text-xs font-semibold">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {listing.rating}
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <Link href={`/tourism/${listing.slug}`}>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug hover:text-red-600 transition-colors cursor-pointer">
                          {listing.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1 italic">
                        {listing.tagline}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 text-justify">
                        {listing.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3">
                        <MapPin size={12} />
                        {listing.location}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {listing.priceRange}
                        </span>
                        <Link
                          href={`/tourism/${listing.slug}`}
                          className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          Discover
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <ClientPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            List Your Tourism Business
          </h2>
          <p className="text-red-100 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Reach thousands of visitors exploring Uganda. Get your safari, lodge, hotel, or experience featured on The Hot Reports.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 font-bold rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </>
  );
}
