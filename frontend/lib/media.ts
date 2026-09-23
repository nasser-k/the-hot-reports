/** Check if an image URL is present and non-empty. */
export function hasImage(url: string | null | undefined): boolean {
  return Boolean(url?.trim());
}
