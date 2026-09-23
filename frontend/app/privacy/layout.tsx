import { Metadata } from "next";
import { getSiteSettingsWithFallback } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsWithFallback();

  return {
    title: `Privacy Policy - ${settings.siteName}`,
    description: `Read ${settings.siteName}'s privacy policy. Learn how we collect, use, and protect your personal information.`,
    alternates: {
      canonical: `${settings.siteUrl}/privacy`,
    },
    openGraph: {
      title: `Privacy Policy - ${settings.siteName}`,
      description: `Read ${settings.siteName}'s privacy policy. Learn how we protect your data.`,
      type: "website",
      locale: "en_UG",
      url: `${settings.siteUrl}/privacy`,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: `Privacy Policy - ${settings.siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Privacy Policy - ${settings.siteName}`,
      description: `Read ${settings.siteName}'s privacy policy. Learn how we protect your data.`,
      images: [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
