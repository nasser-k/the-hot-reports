import { getCategories } from "@/lib/api";
import Footer from "./Footer";

/**
 * Server component wrapper that prefetches categories
 * This prevents the footer categories from appearing late on page load
 */
export default async function FooterWrapper() {
  // Prefetch data on the server (cached for 24 hours via API config)
  const categories = await getCategories().catch(() => []);

  return <Footer initialCategories={categories} />;
}
