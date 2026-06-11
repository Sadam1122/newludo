import { createWhatsappUrl } from "@/lib/whatsapp";

export const DEFAULT_SITE_URL = "http://localhost:3000";
export const DEFAULT_SITE_NAME = "LUDO Sports Kitchen & Coffee";
export const DEFAULT_SITE_TAGLINE = "EAT · WATCH · CONNECT";
export const DEFAULT_SEO_DESCRIPTION =
  "LUDO Sports Kitchen & Coffee adalah sports kitchen dan coffee venue di Bandung untuk nonton big match, reservasi meja, live event, dan hangout malam.";
export const DEFAULT_OG_IMAGE = "/uploads/hero-sports-night.png";
export const DEFAULT_LOGO = "/white-logo.webp";

export const seoKeywords = [
  "LUDO Sports Kitchen & Coffee",
  "LUDO Bandung",
  "sports kitchen Bandung",
  "sports bar Bandung",
  "nonton bola Bandung",
  "tempat nobar Bandung",
  "coffee Bandung",
  "live event Bandung",
  "Kiara Artha Bandung",
  "reservasi meja Bandung",
];

export type SeoSettings = {
  siteName: string;
  siteTagline: string;
  whatsappNumber: string;
  defaultWhatsappMessage: string;
  instagramUrl: string;
  instagramHandle: string;
  tiktokUrl: string;
  tiktokHandle: string;
};

export type SeoLocation = {
  businessName: string;
  address: string;
  mapUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
};

export type SeoFAQ = {
  question: string;
  answer: string;
};

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function buildSeoDescription({
  siteName = DEFAULT_SITE_NAME,
  siteTagline = DEFAULT_SITE_TAGLINE,
  address,
}: {
  siteName?: string;
  siteTagline?: string;
  address?: string | null;
}) {
  const base = `${siteName} (${siteTagline}) adalah sports kitchen dan coffee venue di Bandung untuk nonton big match, reservasi meja, live event, dan hangout malam.`;

  if (!address) {
    return base;
  }

  return `${base} Lokasi: ${address}.`;
}

export function buildHomepageJsonLd({
  settings,
  location,
  faqs,
  image = DEFAULT_OG_IMAGE,
}: {
  settings: SeoSettings;
  location: SeoLocation;
  faqs: SeoFAQ[];
  image?: string | null;
}) {
  const siteUrl = getSiteUrl();
  const businessId = `${siteUrl}/#local-business`;
  const websiteId = `${siteUrl}/#website`;
  const logoUrl = absoluteUrl(DEFAULT_LOGO);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const sameAs = [settings.instagramUrl, settings.tiktokUrl].filter(Boolean);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: settings.siteName,
      url: siteUrl,
      inLanguage: "id-ID",
      publisher: {
        "@id": businessId,
      },
    },
    {
      "@type": ["Restaurant", "CafeOrCoffeeShop", "LocalBusiness"],
      "@id": businessId,
      name: location.businessName || settings.siteName,
      alternateName: settings.siteName,
      url: siteUrl,
      logo: logoUrl,
      image: imageUrl,
      description: buildSeoDescription({
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        address: location.address,
      }),
      telephone: normalizePhoneForSchema(settings.whatsappNumber),
      priceRange: "$$",
      servesCuisine: ["Coffee", "Sports Kitchen", "Casual Dining"],
      address: {
        "@type": "PostalAddress",
        streetAddress: location.address,
        addressLocality: "Bandung",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
      areaServed: {
        "@type": "City",
        name: "Bandung",
      },
      hasMap: location.mapUrl,
      sameAs,
      potentialAction: {
        "@type": "ReserveAction",
        target: createWhatsappUrl(
          settings.whatsappNumber,
          settings.defaultWhatsappMessage,
        ),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: settings.siteName,
          item: siteUrl,
        },
      ],
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faqs.slice(0, 20).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function normalizePhoneForSchema(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("62")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+62${digits.slice(1)}`;
  }

  return phoneNumber;
}
