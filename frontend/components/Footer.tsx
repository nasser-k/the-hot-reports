"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Compass,
  BookOpen,
} from "lucide-react";
import NewsletterForm from "./NewsletterForm";

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import type { CategoryInfo } from "@/data/data";

interface FooterProps {
  initialCategories?: CategoryInfo[];
}

export default function Footer({ initialCategories = [] }: FooterProps) {
  const categories = initialCategories;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Back to top */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4">
          <button
            onClick={scrollToTop}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            <ArrowUp size={14} />
            Back to top
          </button>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Brand, Contact, Newsletter */}
          <div className="space-y-8">
            {/* Brand */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Link href="/" className="flex-shrink-0">
                  <img src="/logo.png" alt="Pulse of Kigezi" className="h-20 w-20 rounded-lg object-cover" />
                </Link>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A leading digital news platform dedicated to delivering trusted news, compelling writer stories, and tourism highlights from Kigezi and beyond.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_FACEBOOK_PAGE || "https://www.facebook.com/profile.php?id=61590570837905"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-blue-600 rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={`https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_HANDLE?.replace('@', '') || 'PulseofKigezi'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-black rounded-full transition-colors"
                  aria-label="X"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || "https://whatsapp.com/channel/0029VbC5UBvJ3juyNbna6L26"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-green-600 rounded-full transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href={`https://tiktok.com/${process.env.NEXT_PUBLIC_TIKTOK_HANDLE || '@pulseofkigezi'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon size={16} />
                </a>
                <a
                  href={`https://youtube.com/${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL || '@PulseofKigezi'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-red-600 rounded-full transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Contact Us
              </h4>
              <ul className="grid grid-cols-1 gap-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                  Kabale, Uganda
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail size={14} className="flex-shrink-0" />
                  <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'info@pulseofkigezi.com'}`} className="hover:text-white transition-colors">
                    {process.env.NEXT_PUBLIC_EMAIL || 'info@pulseofkigezi.com'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Newsletter
              </h4>
              <NewsletterForm minimal />
            </div>
          </div>

          {/* Right Column: Categories, Sections, Quick Links */}
          <div className="space-y-8">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Categories
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sections - Stories & Tourism */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Sections
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Stories Link */}
                <Link
                  href="/stories"
                  className="flex items-center gap-2 p-3 rounded-xl bg-purple-900/30 border border-purple-800/50 hover:bg-purple-900/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-800/50 flex items-center justify-center">
                    <BookOpen size={14} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-300 group-hover:text-purple-200">Stories</p>
                    <p className="text-[11px] text-purple-400/70">Read serial tales</p>
                  </div>
                </Link>

                {/* Tourism Link */}
                <Link
                  href="/tourism"
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-900/30 border border-red-800/50 hover:bg-red-900/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-800/50 flex items-center justify-center">
                    <Compass size={14} className="text-red-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-300 group-hover:text-red-200">Tourism</p>
                    <p className="text-[11px] text-red-400/70">Explore Kigezi</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Quick Links
              </h4>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <li><Link href="/about" className="text-xs text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">Advertise</Link></li>
                <li><Link href="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Pulse of Kigezi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
