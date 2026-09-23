/**
 * Simple dark mode persistence using cookies
 */

const DARK_MODE_COOKIE = "pulse_dark_mode";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Get dark mode preference
 */
export function getDarkMode(): boolean {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie.split("; ");
  const darkCookie = cookies.find((c) => c.startsWith(`${DARK_MODE_COOKIE}=`));

  if (!darkCookie) {
    // Check system preference as fallback
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  return darkCookie.split("=")[1] === "true";
}

/**
 * Save dark mode preference
 */
export function saveDarkMode(isDark: boolean): void {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString();
  document.cookie = `${DARK_MODE_COOKIE}=${isDark}; expires=${expires}; path=/; SameSite=Lax`;
}
