"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Facebook,
  Twitter,
  Youtube,
  Mountain,
  Compass,
  Hotel,
  Tent,
  TreePine,
  Star,
  MapPin,
  BookOpen,
} from "lucide-react";
import { getCategories, getTourismTypes, type TourismTypeInfo } from "@/lib/api";
import type { CategoryInfo } from "@/data/data";
import SearchModal from "./SearchModal";
import LiveAdBanner from "./LiveAdBanner";
import { getDarkMode, saveDarkMode } from "@/lib/preferences";

const TikTokIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface NavbarProps {
  initialCategories?: CategoryInfo[];
  initialTourismTypes?: TourismTypeInfo[];
}

export default function Navbar({ initialCategories = [], initialTourismTypes = [] }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Hydration-safe: server and first client render match (false).
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [tourismOpen, setTourismOpen] = useState(false);
  const [mobileTourismOpen, setMobileTourismOpen] = useState(false);
  const tourismRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<CategoryInfo[]>(initialCategories);
  const [tourismTypes, setTourismTypes] = useState<TourismTypeInfo[]>(initialTourismTypes);

  const inlineCategories = categories.slice(0, 8);
  const moreCategories = categories.slice(8);

  // Map icon names to Lucide components
  const iconMap: Record<string, any> = {
    compass: Compass,
    "tree-pine": TreePine,
    hotel: Hotel,
    tent: Tent,
    mountain: Mountain,
    "map-pin": MapPin,
  };

  // Convert tourism types to link format
  const tourismLinks = tourismTypes.map((type) => ({
    label: type.label,
    href: `/tourism?type=${type.value}`,
    icon: iconMap[type.icon] || MapPin,
    desc: type.description,
  }));

  useEffect(() => {
    // Only fetch if we don't have initial data (client-side navigation)
    if (initialCategories.length === 0) {
      getCategories().then(setCategories).catch(() => setCategories([]));
    }
    if (initialTourismTypes.length === 0) {
      getTourismTypes().then(setTourismTypes).catch(() => setTourismTypes([]));
    }
  }, [initialCategories, initialTourismTypes]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Defer state updates to avoid hydration mismatch
    const timer = setTimeout(() => {
      setMounted(true);
      setDarkMode(getDarkMode());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveDarkMode(newDarkMode);
    
    // Apply immediately
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tourismRef.current && !tourismRef.current.contains(e.target as Node)) {
        setTourismOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* ── Brand header ── */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 lg:static">
        <div className="max-w-[1400px] mx-auto px-4 py-0.5 sm:py-1 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} className="text-gray-900 dark:text-white" />
          </button>

          {/* Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="The Hot Reports" className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-lg object-cover" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center">
            <LiveAdBanner slot="homepage_banner" />
          </div>

          {/* Mobile right actions */}
          <div className="flex lg:hidden items-center gap-0.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && darkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main navigation bar ── */}
      <nav
        className={`hidden lg:block bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 lg:sticky lg:top-0 z-40 transition-shadow duration-300 ${
          scrolled ? "shadow-lg shadow-black/5 dark:shadow-black/30" : ""
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 h-11 relative flex items-center justify-center">
          {/* Category links - centered */}
          <div className="flex items-center gap-0">
            {inlineCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-2.5 py-1.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}

            {/* More dropdown */}
            {moreCategories.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors">
                  More <ChevronDown size={13} />
                </button>
                <div className="absolute top-full left-0 mt-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1.5 min-w-[180px] z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  {moreCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Divider, Stories, and Tourism */}
            {categories.length > 0 && (
              <>
                <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5" />

                {/* Stories Link */}
                <Link
                  href="/stories"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold rounded-md transition-colors whitespace-nowrap text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50"
                >
                  <BookOpen size={14} />
                  Stories
                </Link>

                <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5" />

                {/* Tourism mega-dropdown */}
                <div className="relative" ref={tourismRef}>
                  <button
                    onClick={() => setTourismOpen(!tourismOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold rounded-md transition-colors whitespace-nowrap ${
                      tourismOpen
                        ? "bg-red-600 text-white"
                        : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50"
                    }`}
                  >
                    <Compass size={14} />
                    Tourism
                    <ChevronDown size={13} className={`transition-transform duration-200 ${tourismOpen ? "rotate-180" : ""}`} />
                  </button>
                  {tourismOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 w-[520px] overflow-hidden">
                      {/* Tourism dropdown header */}
                      <div className="bg-gradient-to-r from-gray-950 to-red-950 px-6 py-4">
                        <h3 className="text-white font-black text-sm sm:text-base">Explore Uganda</h3>
                        <p className="text-gray-300 text-[11px] sm:text-xs mt-0.5">The Switzerland of Africa - Safaris, lodges, and unforgettable experiences</p>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-1.5">
                        {tourismLinks.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setTourismOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                              <item.icon size={18} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{item.label}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href="/tourism"
                          onClick={() => setTourismOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                            <Star size={18} className="text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">All Listings</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">Browse all tourism listings</p>
                          </div>
                        </Link>
                      </div>
                      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Want your business listed here?</p>
                        <Link href="/contact" onClick={() => setTourismOpen(false)} className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline">
                          Advertise with us →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right side: search + theme - positioned far right */}
          <div className="absolute right-4 flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Search size={13} />
              <span className="hidden xl:inline">Search…</span>
              <kbd className="hidden xl:inline text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && darkMode ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[320px] max-w-[88vw] bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Link href="/" onClick={() => setMobileOpen(false)} className="inline-block">
                <img src="/logo.png" alt="The Hot Reports" className="h-16 w-16 rounded-lg object-cover" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-500 dark:text-gray-400 text-sm border border-gray-100 dark:border-gray-800"
              >
                <Search size={16} />
                Search articles…
              </button>
            </div>

            {/* Categories - Dynamic from API */}
            {categories.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Sections - Stories & Tourism */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Featured
              </p>
              <div className="grid grid-cols-2 gap-2">
                {/* Stories Card */}
                <Link
                  href="/stories"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col gap-1.5 p-3 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30 rounded-xl transition-colors group border border-purple-100 dark:border-purple-900/30"
                >
                  <BookOpen size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-[13px] font-bold text-purple-700 dark:text-purple-300">Stories</span>
                </Link>

                {/* Tourism Card */}
                <Link
                  href="/tourism"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col gap-1.5 p-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-xl transition-colors group border border-red-100 dark:border-red-900/30"
                >
                  <Compass size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-[13px] font-bold text-red-700 dark:text-red-300">Tourism</span>
                </Link>
              </div>
            </div>

            {/* Tourism section */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setMobileTourismOpen(!mobileTourismOpen)}
                className="w-full flex items-center justify-between text-[13px] font-bold text-red-700 dark:text-red-400 mb-2"
              >
                <span className="flex items-center gap-2">
                  <Compass size={16} />
                  Tourism & Travel
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${mobileTourismOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileTourismOpen && (
                <div className="grid grid-cols-2 gap-2">
                  {tourismLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col gap-1.5 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors group"
                    >
                      <item.icon size={16} className="text-red-500" />
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Theme + socials */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href={process.env.NEXT_PUBLIC_FACEBOOK_PAGE || "https://www.facebook.com/profile.php?id=61590570837905"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook"><Facebook size={14} /></a>
                <a href={`https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_HANDLE?.replace('@', '') || 'TheHotReports'}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-black transition-colors" aria-label="X"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                <a href={process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || "https://whatsapp.com/channel/0029VbC5UBvJ3juyNbna6L26"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-green-500 transition-colors" aria-label="WhatsApp">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a href={`https://tiktok.com/${process.env.NEXT_PUBLIC_TIKTOK_HANDLE || '@thehotreports'}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" aria-label="TikTok"><TikTokIcon size={14} /></a>
                <a href={`https://youtube.com/${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL || '@TheHotReports'}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-red-600 transition-colors" aria-label="YouTube"><Youtube size={14} /></a>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && darkMode ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
