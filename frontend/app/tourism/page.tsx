import { Suspense } from "react";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import TourismListings from "@/components/TourismListings";

export const revalidate = 300; // Revalidate every 5 minutes for fresh content

export default function TourismPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavbarWrapper />

      {/* Full page is client-rendered for query param filtering */}
      <Suspense fallback={
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-1 mb-4">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Loading...
            </p>
          </div>
        </div>
      }>
        <TourismListings />
      </Suspense>

      <FooterWrapper />
    </div>
  );
}
