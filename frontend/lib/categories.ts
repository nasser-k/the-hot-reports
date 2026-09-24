import type { CategoryInfo } from "@/data/data";

/** Fixed news desks. The site does not load or create categories from the API. */
export const NEWS_CATEGORIES: CategoryInfo[] = [
  { name: "National", slug: "national", color: "#A21A47" },
  { name: "Politics", slug: "politics", color: "#9333EA" },
  { name: "Business", slug: "business", color: "#EA580C" },
  { name: "Technology", slug: "technology", color: "#7C3AED" },
  { name: "Education", slug: "education", color: "#2563EB" },
  { name: "Health", slug: "health", color: "#10B981" },
  { name: "Culture & Society", slug: "culture-society", color: "#DB2777" },
  { name: "Sports", slug: "sports", color: "#16A34A" },
  { name: "Op-Ed", slug: "op-ed", color: "#6D28D9" },
  { name: "Africa", slug: "africa", color: "#CA8A04" },
  { name: "World", slug: "world", color: "#0D9488" },
];

const bySlug = new Map(NEWS_CATEGORIES.map((category) => [category.slug, category]));

export function getNewsCategory(slug: string): CategoryInfo | undefined {
  return bySlug.get(slug);
}
