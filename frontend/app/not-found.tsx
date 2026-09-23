import Link from "next/link";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <NavbarWrapper />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-8xl font-black text-red-600 mb-4">404</p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to the latest news.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-full transition-colors"
            >
              Report Issue
            </Link>
          </div>
        </div>
      </main>
      <FooterWrapper />
    </div>
  );
}
