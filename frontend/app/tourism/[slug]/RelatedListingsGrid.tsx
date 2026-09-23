"use client";

import { useState, useCallback } from "react";
import { listTourism } from "@/lib/api";
import type { TourismListing } from "@/data/data";
import Image from "next/image";
import Link from "next/link";
import { hasImage } from "@/lib/media";
import { MapPin, Star, ExternalLink, Compass } from "lucide-react";
import ClientPagination from "@/components/ClientPagination";

interface RelatedListingsGridProps {
  initialListings: TourismListing[];
  initialTotalPages: number;
  initialTotalCount: number;
  listingType: string;
  excludeSlug: string;
  listingsPerPage: number;
  typeLabel: string;
}

export default function RelatedListingsGrid({
  initialListings,
  initialTotalPages,
  initialTotalCount,
  listingType,
  excludeSlug,
  listingsPerPage,
  typeLabel,
}: RelatedListingsGridProps) {
  const [listings, setListings] = useState<TourismListing[]>(initialListings);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setCurrentPage(page);

      try {
        const res = await listTourism({ page, pageSize: listingsPerPage });
        
        // Filter by same type, excluding current
        const filtered = res.results.filter(
          (l) => l.type === listingType && l.slug !== excludeSlug
        );
        
        setListings(filtered);
        // Estimate total pages based on filtered results
        const estimatedTotal = Math.ceil((res.count || 0) / listingsPerPage);
        setTotalPages(estimatedTotal > 0 ? estimatedTotal : 1);
        setTotalCount(res.count || 0);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [listingType, excludeSlug, listingsPerPage]
  );

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className={isLoading ? "opacity-50" : ""}>
      {/* Section Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <Compass size={20} className="text-red-600" />
        Related {typeLabel}s
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/tourism/${listing.slug}`}
            className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-800 transition-all hover:shadow-md"
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
              {hasImage(listing.image) ? (
                <Image
                  src={listing.image!}
                  alt={listing.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30 flex items-center justify-center">
                  <Compass className="text-green-300 dark:text-green-800" size={40} />
                </div>
              )}
              {/* Rating */}
              {listing.rating && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  {Number(listing.rating).toFixed(1)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                {listing.name}
              </h3>
              
              {listing.location && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin size={12} />
                  <span className="truncate">{listing.location}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {listing.priceRange}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 group-hover:text-red-700 transition-colors">
                  Discover
                  <ExternalLink size={12} />
                </span>
              </div>
            </div>
          </Link>
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
    </div>
  );
}
