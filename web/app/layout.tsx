import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

import { IntlClientProvider } from "@/i18n/IntlClientProvider";
import type { AppLocale } from "@/i18n/locales";
import { isSupportedTheme, THEME_COOKIE } from "@/theme/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voila-africa.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      // Google Title Tag — under 60 chars, keyword-first
      default: t("titleDefault"),
      template: "%s | Voila",
    },
    // Meta Description — under 155 chars, includes primary keyword + CTA signal
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    authors: [{ name: "Voila" }],
    creator: "Voila",
    publisher: "Voila",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: SITE_URL,
      siteName: "Voila",
      // og:title — punchy, under 60 chars, reads well as a link preview
      title: t("ogTitle"),
      // og:description — hooks the reader, fits WhatsApp/LinkedIn preview truncation (~150 chars)
      description: t("ogDescription"),
      images: [
        {
          // og:image — must be 1200×630px, under 8 MB, hosted at an absolute URL
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      // twitter:title
      title: t("ogTitle"),
      // twitter:description
      description: t("twitterDescription"),
      // twitter:image — Twitter crops to ~2:1, keep key visual centred
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: SITE_URL,
    },
    icons: {
      icon: "/images/main_logo.png",
      shortcut: "/images/main_logo.png",
      apple: "/images/main_logo.png",
    },
    category: "education",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages, cookieStore] = await Promise.all([getLocale(), getMessages(), cookies()]);
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const isDark = isSupportedTheme(cookieTheme) && cookieTheme === "dark";

  return (
    <html lang={locale} className={`${inter.variable}${isDark ? " dark" : ""}`}>
      <body className="font-sans antialiased bg-white text-[#1A1A1A] min-h-screen">
        <IntlClientProvider initialLocale={locale as AppLocale} initialMessages={messages}>
          {children}
        </IntlClientProvider>
      </body>
    </html>
  );
}
