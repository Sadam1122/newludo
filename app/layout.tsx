import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Montserrat } from "next/font/google";
import type { ReactNode } from "react";

import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SITE_NAME,
  absoluteUrl,
  getSiteUrl,
  seoKeywords,
} from "@/lib/seo";

import "./globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: DEFAULT_SITE_NAME,
  title: {
    default: DEFAULT_SITE_NAME,
    template: `%s | ${DEFAULT_SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  keywords: seoKeywords,
  authors: [{ name: DEFAULT_SITE_NAME }],
  creator: DEFAULT_SITE_NAME,
  publisher: DEFAULT_SITE_NAME,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: absoluteUrl("/"),
    siteName: DEFAULT_SITE_NAME,
    title: DEFAULT_SITE_NAME,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        alt: DEFAULT_SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SITE_NAME,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "restaurant",
  icons: {
    icon: "/white-logo.webp",
    shortcut: "/white-logo.webp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${bebasNeue.variable} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
