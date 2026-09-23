import { getCategories, getTourismTypes } from "@/lib/api";
import Navbar from "./Navbar";
import UtilityBar from "./UtilityBar";

/**
 * Server component wrapper that prefetches categories and tourism types
 * This prevents the navbar from appearing late on page load
 */
export default async function NavbarWrapper() {
  // Prefetch data on the server (cached for 24 hours)
  const [categories, tourismTypes] = await Promise.all([
    getCategories().catch(() => []),
    getTourismTypes().catch(() => []),
  ]);

  return (
    <>
      <UtilityBar />
      <Navbar initialCategories={categories} initialTourismTypes={tourismTypes} />
    </>
  );
}
