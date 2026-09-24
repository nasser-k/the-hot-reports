import type {
  Article,
  StoryEpisode,
  StoryGenreInfo,
  StorySeries,
  StorySeriesWithEpisodes,
  TeamMember,
  TourismListing,
  TourismType,
  SiteSettings,
} from "@/data/data";
import { getVisitorId } from "./visitor";

const DEFAULT_BASE = "http://127.0.0.1:8000/api/v1";

export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(status: number, statusText: string, data?: unknown): string {
  // User-friendly error messages based on status code
  switch (status) {
    case 400:
      return "Please check your information and try again.";
    case 401:
      return "You need to sign in to continue.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you're looking for.";
    case 409:
      return "This already exists. Please try something different.";
    case 422:
      // Validation errors - try to extract field-specific messages
      if (data && typeof data === "object") {
        const errors = Object.entries(data).flatMap(([key, value]) => {
          if (Array.isArray(value)) return value;
          if (typeof value === "string") return [value];
          return [];
        });
        if (errors.length > 0) {
          return errors.join(". ");
        }
      }
      return "Please check your information and try again.";
    case 429:
      if (data && typeof data === "object" && "detail" in data && typeof (data as any).detail === "string") {
        return (data as any).detail;
      }
      return "You're doing that too fast. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Something went wrong on our end. Please try again later.";
    default:
      return statusText || "Something went wrong. Please try again.";
  }
}

async function request<T>(
  path: string,
  opts?: RequestInit & { noStore?: boolean }
): Promise<T> {
  const url = `${apiBase()}${path}`;
  let res: Response;

  const isFormData = typeof FormData !== "undefined" && opts?.body instanceof FormData;
  try {
    res = await fetch(url, {
      ...opts,
      cache: opts?.noStore ? "no-store" : opts?.cache,
      next: opts?.next,
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(opts?.headers || {}),
      },
    });
  } catch (error) {
    // Network errors (offline, DNS failure, timeout, etc.)
    throw new ApiError(
      "Can't connect to the server. Please check your internet connection and try again.",
      0,
      "Network Error"
    );
  }

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      // If JSON parsing fails, use text
      const text = await res.text().catch(() => "");
      data = text;
    }
    
    const message = getErrorMessage(res.status, res.statusText, data);
    throw new ApiError(message, res.status, res.statusText, data);
  }
  
  return (await res.json()) as T;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  results: T[];
}

export async function listArticles(params?: {
  category?: string;
  search?: string;
  highlight?: "featured" | "breaking" | "trending";
  tag?: string;
  page?: number;
  pageSize?: number;
  ordering?: string;
  noStore?: boolean;
}): Promise<Paginated<Article>> {
  const p = new URLSearchParams();
  if (params?.category) p.set("category", params.category);
  if (params?.search) p.set("search", params.search);
  if (params?.highlight) p.set("highlight", params.highlight);
  if (params?.tag) p.set("tag", params.tag);
  if (params?.page) p.set("page", String(params.page));
  if (params?.pageSize) p.set("page_size", String(params.pageSize));
  if (params?.ordering) p.set("ordering", params.ordering);
  const qs = p.toString() ? `?${p.toString()}` : "";
  return request<Paginated<Article>>(`/articles/${qs}`, {
    noStore: params?.noStore,
  });
}

export async function getArticle(slug: string): Promise<Article> {
  return request<Article>(`/articles/${encodeURIComponent(slug)}/`);
}

export async function getRelated(slug: string, limit = 4): Promise<Article[]> {
  return request<Article[]>(
    `/articles/${encodeURIComponent(slug)}/related/?limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listTourism(params?: {
  type?: TourismType;
  featured?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<TourismListing>> {
  const p = new URLSearchParams();
  if (params?.type) p.set("type", params.type);
  if (params?.featured !== undefined) p.set("featured", String(params.featured));
  if (params?.search) p.set("search", params.search);
  if (params?.page) p.set("page", String(params.page));
  if (params?.pageSize) p.set("page_size", String(params.pageSize));
  const qs = p.toString() ? `?${p.toString()}` : "";
  return request<Paginated<TourismListing>>(`/tourism/${qs}`);
}

export async function getTourismBySlug(slug: string): Promise<TourismListing> {
  return request<TourismListing>(`/tourism/${encodeURIComponent(slug)}/`);
}

export interface TourismTypeInfo {
  value: string;
  label: string;
  icon: string;
  description: string;
}

export async function getTourismTypes(): Promise<TourismTypeInfo[]> {
  return request<TourismTypeInfo[]>("/tourism/types/", { 
    next: { tags: ['tourism-types'] }
  });
}

export async function subscribeNewsletter(email: string): Promise<{
  email: string;
  alreadySubscribed: boolean;
}> {
  return request("/newsletter/subscribe/", {
    method: "POST",
    body: JSON.stringify({ email }),
    noStore: true,
  });
}

export async function submitContact(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean }> {
  return request("/contact/", {
    method: "POST",
    body: JSON.stringify(payload),
    noStore: true,
  });
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return request<TeamMember[]>("/team/");
}

// ============================================
// STORY API FUNCTIONS
// ============================================

export async function listStorySeries(params?: {
  genre?: string;
  status?: "published" | "ongoing" | "completed";
  search?: string;
  page?: number;
  pageSize?: number;
  ordering?: string;
}): Promise<Paginated<StorySeries>> {
  const p = new URLSearchParams();
  if (params?.genre) p.set("genre", params.genre);
  if (params?.status) p.set("status", params.status);
  if (params?.search) p.set("search", params.search);
  if (params?.page) p.set("page", String(params.page));
  if (params?.pageSize) p.set("page_size", String(params.pageSize));
  if (params?.ordering) p.set("ordering", params.ordering);
  const qs = p.toString() ? `?${p.toString()}` : "";
  return request<Paginated<StorySeries>>(`/stories/series/${qs}`);
}

export async function getStorySeriesBySlug(slug: string): Promise<StorySeriesWithEpisodes> {
  return request<StorySeriesWithEpisodes>(`/stories/series/${encodeURIComponent(slug)}/`);
}

export async function getStoryEpisodeBySlug(slug: string): Promise<StoryEpisode> {
  const url = `/stories/episodes/${encodeURIComponent(slug)}/`;
  return request<StoryEpisode>(url);
}

export async function getStoryGenres(): Promise<StoryGenreInfo[]> {
  return request<StoryGenreInfo[]>("/stories/series/genres/", {
    next: { tags: ["story-genres"] },
  });
}

export async function getStoriesByAuthor(authorSlug: string): Promise<StorySeries[]> {
  return request<StorySeries[]>(`/stories/series/by-author/?author=${encodeURIComponent(authorSlug)}`);
}

// ============================================
// STORY ENGAGEMENT API
// ============================================

export async function likeStoryEpisode(slug: string): Promise<{ liked: boolean; likesCount: number }> {
  const visitorId = getVisitorId();
  return request<{ liked: boolean; likesCount: number }>(
    `/stories/episodes/${encodeURIComponent(slug)}/like/`,
    {
      method: "POST",
      body: JSON.stringify({ visitorId }),
      noStore: true,
    }
  );
}

export async function commentOnStoryEpisode(
  slug: string,
  data: { name: string; email?: string; content: string; parent?: string }
): Promise<{ success: boolean; message: string; comment?: any }> {
  return request<{ success: boolean; message: string; comment?: any }>(
    `/stories/episodes/${encodeURIComponent(slug)}/comment/`,
    {
      method: "POST",
      body: JSON.stringify(data),
      noStore: true,
    }
  );
}

export async function shareStoryEpisode(
  slug: string,
  platform: "facebook" | "whatsapp" | "twitter" | "copy"
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(
    `/stories/episodes/${encodeURIComponent(slug)}/share/`,
    {
      method: "POST",
      body: JSON.stringify({ platform }),
      noStore: true,
    }
  );
}

export function trackStoryEpisodeView(slug: string): void {
  const visitorId = getVisitorId();
  fetch(`${apiBase()}/stories/episodes/${encodeURIComponent(slug)}/track-view/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ visitorId: visitorId ?? undefined }),
  }).catch(() => {});
}

export function trackArticleView(slug: string): void {
  const visitorId = getVisitorId();
  fetch(`${apiBase()}/articles/${encodeURIComponent(slug)}/view/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ visitorId: visitorId ?? undefined }),
  }).catch(() => {});
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  return request<SiteSettings>("/settings/");
}

export function defaultSiteSettings(): SiteSettings {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://thehotreports.com",
    siteName: "The Hot Reports",
    siteDescription:
      "Nationwide news, serial stories, and travel reporting from across Uganda.",
    ogImage: "/og-image.png",
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@thehotreports",
    storiesMeta: {
      title: "Serial Stories",
      description:
        "Serial stories from writers across Uganda. Follow each episode as it is published.",
      keywords: ["serial stories", "Uganda fiction", "narrative journalism", "short stories"],
    },
    authorsMeta: {
      title: "Story Writers",
      description: "Writers publishing serial stories on The Hot Reports.",
      keywords: ["story writers", "Uganda writers", "serial stories"],
    },
    articleMeta: {
      titleTemplate: "{title} | The Hot Reports",
      description: "Nationwide news from The Hot Reports.",
    },
    categoryMeta: {
      titleTemplate: "{category} News | The Hot Reports",
      description: "Latest {category} news from across Uganda.",
    },
    tourismMeta: {
      title: "Tourism & Travel",
      description: "Safaris, lodges, hotels, and cultural travel across Uganda.",
      keywords: ["Uganda tourism", "Uganda safaris", "Uganda travel", "lodges", "hotels"],
    },
    aboutMeta: {
      title: "About The Hot Reports",
      description: "The Hot Reports is a nationwide digital newsroom covering Uganda.",
    },
  };
}

export async function getSiteSettingsWithFallback(): Promise<SiteSettings> {
  return fetchSiteSettings().catch(() => defaultSiteSettings());
}

export function isApiNotFound(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 404) return true;
  if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
    return true;
  }
  if (err instanceof Error && err.message.includes("404")) return true;
  return false;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
