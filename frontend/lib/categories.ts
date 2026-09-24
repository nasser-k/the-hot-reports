import type { CategoryInfo } from "@/data/data";

/** News desks used in navigation, section labels, and article pages. */
export const NEWS_CATEGORIES: CategoryInfo[] = [
  { name: "National", slug: "national", color: "#A21A47" },
  { name: "Politics", slug: "politics", color: "#152238" },
  { name: "Business", slug: "business", color: "#1B4D3E" },
  { name: "Technology", slug: "technology", color: "#243044" },
  { name: "Education", slug: "education", color: "#3A4578" },
  { name: "Health", slug: "health", color: "#0E5C56" },
  { name: "Culture & Society", slug: "culture-society", color: "#6B3050" },
  { name: "Sports", slug: "sports", color: "#8C3A14" },
  { name: "Op-Ed", slug: "op-ed", color: "#4A4036" },
  { name: "Africa", slug: "africa", color: "#8A5A12" },
  { name: "World", slug: "world", color: "#1A5670" },
];

const bySlug = new Map(NEWS_CATEGORIES.map((category) => [category.slug, category]));

export function getNewsCategory(slug: string): CategoryInfo | undefined {
  return bySlug.get(slug);
}
