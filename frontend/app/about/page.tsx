import Link from "next/link";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { Target, Eye, Heart } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com";

export const revalidate = 3600;

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "The Hot Reports",
    description: "A nationwide digital newsroom covering Uganda.",
    url: BASE_URL,
    address: {
      "@type": "PostalAddress",
      addressCountry: "UG",
    },
    areaServed: {
      "@type": "Country",
      name: "Uganda",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <NavbarWrapper />

        <section className="relative bg-gray-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-gray-950" />
          <div className="relative max-w-[1400px] mx-auto px-4 py-16 sm:py-24 text-center">
            <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4">
              About Us
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6">
              News for the whole country
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              The Hot Reports is a nationwide newsroom. We publish reported news,
              serial stories, and travel coverage from across Uganda.
            </p>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
              <Target size={32} className="text-red-600 mb-4" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                To give readers across Uganda clear, timely reporting they can use
                to understand what is happening in the country.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
              <Eye size={32} className="text-red-600 mb-4" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Our Vision
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                To be a national newsroom people trust for politics, business,
                culture, sport, and the stories that connect the country.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
              <Heart size={32} className="text-red-600 mb-4" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Our Values
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                Accuracy, independence, and clarity. We report what we can verify,
                and we correct the record when we get something wrong.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4">
            Have a Story Tip?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
            Send tips, corrections, and collaboration notes to the newsroom.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-full transition-colors"
            >
              Read Latest News
            </Link>
          </div>
        </section>

        <FooterWrapper />
      </div>
    </>
  );
}
