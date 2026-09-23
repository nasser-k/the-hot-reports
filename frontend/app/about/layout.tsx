import { Metadata } from "next";
import { getSiteSettingsWithFallback } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsWithFallback();

  return {
    title: settings.aboutMeta.title,
    description: settings.aboutMeta.description,
    alternates: {
      canonical: `${settings.siteUrl}/about`,
    },
    openGraph: {
      title: settings.aboutMeta.title,
      description: settings.aboutMeta.description,
      type: "website",
      locale: "en_UG",
      url: `${settings.siteUrl}/about`,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: settings.aboutMeta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.aboutMeta.title,
      description: settings.aboutMeta.description,
      images: [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
