import { Metadata } from "next";
import { getSiteSettingsWithFallback } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsWithFallback();

  return {
    title: `Contact Us - ${settings.siteName}`,
    description: `Get in touch with ${settings.siteName}. Have a story tip, feedback, or want to advertise with us?`,
    alternates: {
      canonical: `${settings.siteUrl}/contact`,
    },
    openGraph: {
      title: `Contact Us - ${settings.siteName}`,
      description: `Get in touch with ${settings.siteName}. Have a story tip or feedback?`,
      type: "website",
      locale: "en_UG",
      url: `${settings.siteUrl}/contact`,
      siteName: settings.siteName,
      images: [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: `Contact ${settings.siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Contact Us - ${settings.siteName}`,
      description: `Get in touch with ${settings.siteName}. Have a story tip or feedback?`,
      images: [settings.ogImage],
      site: settings.twitterHandle,
    },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
