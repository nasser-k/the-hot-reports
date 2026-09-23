import { Metadata } from "next";
import { getSiteSettingsWithFallback } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsWithFallback();

  return {
    title: settings.tourismMeta.title,
    description: settings.tourismMeta.description,
    keywords: settings.tourismMeta.keywords,
    alternates: {
      canonical: `${settings.siteUrl}/tourism`,
    },
    openGraph: {
      title: settings.tourismMeta.title,
      description: settings.tourismMeta.description,
      type: "website",
      locale: "en_UG",
      url: `${settings.siteUrl}/tourism`,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: settings.tourismMeta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.tourismMeta.title,
      description: settings.tourismMeta.description,
      images: [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function TourismLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
