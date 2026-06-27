import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voila-africa.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Google Title Tag — under 60 chars, keyword-first
    default: "Voila | Scholarships, Internships & Mentorship Africa",
    template: "%s | Voila",
  },
  // Meta Description — under 155 chars, includes primary keyword + CTA signal
  description:
    "Join 24,000+ African students discovering scholarships, internships, fellowships and 1:1 mentorship on Voila. Free CV builder included.",
  keywords: [
    "scholarships for African students",
    "internships Africa",
    "fellowships Africa",
    "student mentorship platform",
    "free CV builder for students",
    "career opportunities Africa",
    "student opportunities platform",
    "Voila",
    "Voila Africa"
  ],
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
    locale: "en_US",
    url: SITE_URL,
    siteName: "Voila",
    // og:title — punchy, under 60 chars, reads well as a link preview
    title: "Voila — Find Your Next Opportunity",
    // og:description — hooks the reader, fits WhatsApp/LinkedIn preview truncation (~150 chars)
    description:
      "Scholarships, internships, mentorship and a free CV builder — all personalised to your profile. Join 24,000+ African students already on Voila.",
    images: [
      {
        // og:image — must be 1200×630px, under 8 MB, hosted at an absolute URL
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voila — Scholarships, Internships & Mentorship for African Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // twitter:title
    title: "Voila — Find Your Next Opportunity",
    // twitter:description
    description:
      "Scholarships, internships, mentorship and a free CV builder — personalised for African students. Free to join.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-[#1A1A1A] min-h-screen">
        {children}
      </body>
    </html>
  );
}
