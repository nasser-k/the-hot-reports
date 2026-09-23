import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PWARegister from "@/components/PWARegister";
import NotificationPrompt from "@/components/NotificationPrompt";
import { getSiteSettingsWithFallback } from "@/lib/api";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsWithFallback();

  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: settings.siteName,
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: settings.siteName,
      description: settings.siteDescription,
      type: "website",
      locale: "en_UG",
      url: settings.siteUrl,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: settings.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.siteDescription,
      images: [settings.ogImage],
      creator: settings.twitterHandle,
      site: settings.twitterHandle,
    },
    alternates: {
      canonical: settings.siteUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var cookies = document.cookie.split('; ');
                  var darkCookie = cookies.find(function(c) { return c.startsWith('hotreports_dark_mode='); });
                  var isDark = false;
                  
                  if (darkCookie) {
                    isDark = darkCookie.split('=')[1] === 'true';
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    isDark = true;
                  }
                  
                  var html = document.documentElement;
                  if (isDark) {
                    html.classList.add('dark');
                    // Set CSS variables immediately to prevent flash
                    html.style.setProperty('--background', '#030712');
                    html.style.setProperty('--foreground', '#f3f4f6');
                  } else {
                    // Set light mode variables immediately
                    html.style.setProperty('--background', '#ffffff');
                    html.style.setProperty('--foreground', '#111827');
                  }
                  // Apply background to HTML directly
                  html.style.backgroundColor = isDark ? '#030712' : '#ffffff';
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2490742131633018"
          crossOrigin="anonymous"
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        {children}
        <PWARegister />
        <NotificationPrompt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
