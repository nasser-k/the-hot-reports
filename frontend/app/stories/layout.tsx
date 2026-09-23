import { Metadata } from "next";
import { getSiteSettingsWithFallback } from "@/lib/api";

export const revalidate = 300; // Revalidate every 5 minutes for fresh content

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsWithFallback();

  return {
    title: settings.storiesMeta.title,
    description: settings.storiesMeta.description,
    keywords: settings.storiesMeta.keywords,
    alternates: {
      canonical: `${settings.siteUrl}/stories`,
    },
    openGraph: {
      title: settings.storiesMeta.title,
      description: settings.storiesMeta.description,
      type: "website",
      locale: "en_UG",
      url: `${settings.siteUrl}/stories`,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: settings.storiesMeta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.storiesMeta.title,
      description: settings.storiesMeta.description,
      images: [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
