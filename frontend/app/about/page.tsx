import Link from "next/link";
import Image from "next/image";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { Users, Target, Eye, MapPin, Calendar, Newspaper, Heart } from "lucide-react";
import { getStatistics, getTeamMembers } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pulseofkigezi.com";

export const revalidate = 300; // Revalidate every 5 minutes for fresh stats

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

export default async function AboutPage() {
  // Fetch real statistics and team members from API
  const [stats, team] = await Promise.all([
    getStatistics().catch(() => ({
      articles: {
        total: 0,
        monthlyReaders: 0,
      },
      stories: {
        totalSeries: 0,
      },
      yearsActive: 0,
    })),
    getTeamMembers().catch(() => []),
  ]);

  const statsDisplay = [
    { 
      icon: Newspaper, 
      label: "Articles Published", 
      value: stats.articles?.total > 0 ? formatNumber(stats.articles.total) : "0" 
    },
    { 
      icon: Users, 
      label: "Monthly Readers", 
      value: stats.articles?.monthlyReaders > 0 ? `${formatNumber(stats.articles.monthlyReaders)}+` : "0" 
    },
    { 
      icon: MapPin, 
      label: "Story Series", 
      value: stats.stories?.totalSeries > 0 ? formatNumber(stats.stories.totalSeries) : "0" 
    },
    { 
      icon: Calendar, 
      label: "Years Active", 
      value: stats.yearsActive > 0 ? `${stats.yearsActive}+` : "0" 
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pulse of Kigezi",
    description: "The leading digital news platform covering the Kigezi sub-region of Uganda.",
    url: "https://pulseofkigezi.com",
    foundingDate: "2023",
    location: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kabale",
        addressRegion: "Kigezi",
        addressCountry: "UG",
      },
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

        {/* Hero */}
        <section className="relative bg-gray-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-gray-950" />
          <div className="relative max-w-[1400px] mx-auto px-4 py-16 sm:py-24 text-center">
            <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4">
              About Us
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6">
              The <span className="text-red-500">Heartbeat</span> of the Hills
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              A leading digital news platform dedicated to delivering
              trusted news, compelling writer stories, and tourism highlights from Kigezi and beyond.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-[1400px] mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsDisplay.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center shadow-sm"
              >
                <stat.icon size={24} className="text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-[1400px] mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
              <Target size={32} className="text-red-600 mb-4" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                To empower the people of Kigezi with reliable, unbiased, and timely news
                that informs decisions, drives accountability, and fosters community engagement.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
              <Eye size={32} className="text-red-600 mb-4" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Our Vision
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                To be the most trusted and influential digital news source in the Kigezi
                sub-region, setting the standard for quality journalism in Western Uganda.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
              <Heart size={32} className="text-red-600 mb-4" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Our Values
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                Truth. Integrity. Community. We believe in reporting facts without fear or
                favour, serving the interests of the people of Kigezi above all else.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        {/* <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-red-600 text-sm font-bold uppercase tracking-widest mb-2">
                Our Team
              </p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Meet Our Team
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg mx-auto">
                A dedicated team of professionals committed to bringing you the stories
                that matter most.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {team.length > 0 ? (
                team.map((member) => (
                  <div
                    key={member.fullName}
                    className="w-[160px] bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center hover:shadow-lg transition-shadow"
                  >
                    <Image
                      src={member.avatar}
                      alt={member.fullName}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {member.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Team members will be displayed here soon.</p>
                </div>
              )}
            </div>
          </div>
        </section> */}

        {/* CTA */}
        <section className="max-w-[1400px] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4">
            Have a Story Tip?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
            We&apos;re always looking for the next big story. Reach out to our newsroom
            with tips, feedback, or collaboration opportunities.
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
