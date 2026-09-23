import { apiBase } from "./api";
import type { LiveAdSlot } from "./ad-slots";

/** Paid/house ad from GET /api/v1/ads/serve/<slot>/ (camelCase JSON). */
export interface AdData {
  id: number;
  name: string;
  clientName: string;
  imageUrl: string | null;
  altText: string;
  linkUrl: string;
  slotKey: string;
  isHouseAd: boolean;
}

export interface AdResponse {
  ad: AdData | null;
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/**
 * Fetch active paid or house ad for a slot.
 * Returns { ad: null } on empty slot or network error → LiveAdBanner uses AdSense.
 */
export async function getAd(
  slotKey: LiveAdSlot,
  context?: { page?: string }
): Promise<AdResponse> {
  const params = new URLSearchParams();
  if (context?.page) params.set("page", context.page);

  try {
    const qs = params.toString();
    const path = qs
      ? `/ads/serve/${slotKey}/?${qs}`
      : `/ads/serve/${slotKey}/`;
    // Cache for 5 minutes (same as homepage revalidate)
    return await request<AdResponse>(path, {
      next: { revalidate: 300, tags: ['ads', `ad-${slotKey}`] }
    });
  } catch {
    return { ad: null };
  }
}

export function trackAdClick(
  adId: number,
  context?: { page?: string }
): void {
  const url = `${apiBase()}/ads/click/${adId}/`;
  const payload = JSON.stringify({ page: context?.page });
  const blob = new Blob([payload], { type: "application/json" });

  // Use sendBeacon for reliable tracking that works even when navigating away
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, blob);
  } else {
    // Fallback to fetch for browsers without sendBeacon
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Non-blocking analytics
    });
  }
}
