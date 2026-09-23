export interface CategoryInfo {
  name: string;
  slug: string;
  color: string;
}

export interface ArticleAuthorInfo {
  name: string;
  avatar: string;
}

export type ArticleHighlight = "" | "featured" | "breaking" | "trending";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: CategoryInfo;
  author: ArticleAuthorInfo;
  image: string;
  imageAttribution?: string;
  publishedAt: string;
  readTime: number;
  highlight: ArticleHighlight;
  tags: string[];
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export type TourismType = "safari" | "lodge" | "hotel" | "campsite" | "experience";

export interface TourismListing {
  id: string;
  slug: string;
  name: string;
  type: TourismType;
  tagline: string;
  description: string;
  image: string;
  location: string;
  priceRange: string;
  rating: number;
  featured: boolean;
  website?: string;
  phone?: string;
  tags: string[];
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

// Story Series Types
export type StoryGenre =
  | "village_drama"
  | "campus_life"
  | "family"
  | "cultural"
  | "true_life"
  | "crime"
  | "inspirational";

export type StoryStatus = "draft" | "ongoing" | "completed";

export interface StoryAuthor {
  name: string;
  slug: string;
  avatar: string;
  bio: string;
}

export interface StoryEpisodeListItem {
  id: string;
  slug: string;
  episodeNumber: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTimeMinutes: number;
  viewsTotal: number;
  likesCount: number;
  commentsCount: number;
  image?: string;
  imageAttribution?: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface StorySeries {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  author: StoryAuthor;
  genre: StoryGenre;
  coverImage?: string;
  status: StoryStatus;
  totalEpisodes: number;
  publishedAt: string;
  socialSnippet: string;
  viewsTotal: number;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface StorySeriesWithEpisodes extends StorySeries {
  episodes: StoryEpisodeListItem[];
}

export interface StoryEpisodeNavigation {
  id: string;
  slug: string;
  episodeNumber: number;
  title: string;
}

export interface StoryImage {
  id: string;
  imageUrl: string;
  caption: string;
  order: number;
}

export interface StoryComment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  replies: StoryComment[];
}

export interface StoryEpisode {
  id: string;
  slug: string;
  series: StorySeries;
  episodeNumber: number;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTimeMinutes: number;
  nextEpisodeTeaser: string;
  previousEpisode: StoryEpisodeNavigation | null;
  nextEpisode: StoryEpisodeNavigation | null;
  isFirstEpisode: boolean;
  isLastPublishedEpisode: boolean;
  image?: string;
  imageAttribution?: string;
  comments: StoryComment[];
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
  viewsTotal: number;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface StoryGenreInfo {
  value: StoryGenre;
  label: string;
  description: string;
}

export interface TeamMember {
  slug: string;
  fullName: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
  storiesMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
  authorsMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
  articleMeta: {
    titleTemplate: string;
    description: string;
  };
  categoryMeta: {
    titleTemplate: string;
    description: string;
  };
  tourismMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
  aboutMeta: {
    title: string;
    description: string;
  };
}
