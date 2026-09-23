"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, User } from "lucide-react";
import { type Article } from "@/data/data";
import { hasImage } from "@/lib/media";

interface ArticleCardProps {
  article: Article;
  variant?: "hero" | "featured" | "standard" | "compact" | "horizontal";
}

export default function ArticleCard({
  article,
  variant = "standard",
}: ArticleCardProps) {
  const catColor = article.category?.color || "#A21A47";

  if (variant === "hero") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group relative block overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      >
        {hasImage(article.image) && (
          <Image
            src={article.image!}
            alt={article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 75vw"
            className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {article.highlight === "breaking" && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full animate-soft-blink">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            Breaking
          </div>
        )}
        {article.highlight === "featured" && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
            Featured
          </div>
        )}
        {article.highlight === "trending" && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
            Trending
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-snug sm:leading-tight mb-2 sm:mb-3 group-hover:text-red-400 transition-colors line-clamp-3">
            {article.title}
          </h2>
          <p className="hidden sm:block text-sm md:text-base text-gray-300 line-clamp-2 max-w-2xl mb-3 text-justify">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Image
                src={article.author.avatar}
                alt="Reporter"
                width={20}
                height={20}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
              />
              <span className="truncate max-w-[100px] sm:max-w-none">Reporter</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(article.publishedAt).toLocaleDateString("en-UG", {
                month: "short",
                day: "numeric",
                timeZone: "Africa/Kampala",
              })}
            </span>
            <span className="hidden sm:inline">{article.readTime} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {hasImage(article.image) && (
          <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
            <Image
              src={article.image!}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              priority
            />
            <span
              className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white"
              style={{ backgroundColor: catColor }}
            >
              {article.category.name}
            </span>
          </div>
        )}
        <div className={`p-4 ${!hasImage(article.image) ? 'pt-3' : ''}`}>
          {!hasImage(article.image) && (
            <span
              className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white mb-2"
              style={{ backgroundColor: catColor }}
            >
              {article.category.name}
            </span>
          )}
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 text-justify">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Image
                src={article.author.avatar}
                alt="Reporter"
                width={16}
                height={16}
                className="w-4 h-4 rounded-full"
              />
              Reporter
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {new Date(article.publishedAt).toLocaleDateString("en-UG", {
                month: "short",
                day: "numeric",
                timeZone: "Africa/Kampala",
              })}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
      >
        {hasImage(article.image) && (
          <div className="relative w-32 h-24 sm:w-36 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={article.image!}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 112px, 144px"
              className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: catColor }}
          >
            {article.category.name}
          </span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors mt-0.5">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            <Clock size={10} />
            {new Date(article.publishedAt).toLocaleDateString("en-UG", {
              month: "short",
              day: "numeric",
              timeZone: "Africa/Kampala",
            })}
            <span>·</span>
            <span>{article.readTime} min</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
      >
        <span className="text-xl sm:text-2xl font-black text-gray-200 dark:text-gray-700 leading-none mt-0.5 flex-shrink-0 w-7 text-center">
          {article.id}
        </span>
        <div className="flex-1 min-w-0">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: catColor }}
          >
            {article.category.name}
          </span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <Clock size={10} />
            {new Date(article.publishedAt).toLocaleDateString("en-UG", {
              month: "short",
              day: "numeric",
              timeZone: "Africa/Kampala",
            })}
          </span>
        </div>
      </Link>
    );
  }

  // Standard variant
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
    >
      {hasImage(article.image) && (
        <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
          <Image
            src={article.image!}
            alt={article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white"
            style={{ backgroundColor: catColor }}
          >
            {article.category.name}
          </span>
        </div>
      )}
      <div className={`p-4 ${!hasImage(article.image) ? 'pt-3' : ''}`}>
        {!hasImage(article.image) && (
          <span
            className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white mb-2"
            style={{ backgroundColor: catColor }}
          >
            {article.category.name}
          </span>
        )}
        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 text-justify">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <User size={11} />
            Reporter
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(article.publishedAt).toLocaleDateString("en-UG", {
              month: "short",
              day: "numeric",
              timeZone: "Africa/Kampala",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
