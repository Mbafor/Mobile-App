import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnimatedStat from "./components/AnimatedStat";
import FaqItem from "./components/FaqItem";
import ScrollReveal from "./components/ScrollReveal";
import OpportunityCarousel from "./components/OpportunityCarousel";
import TestimonialCarousel from "./components/TestimonialCarousel";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.voila-africa.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voila-africa.com";
const SIGNUP_URL = `${APP_URL}/welcome`;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "";

async function getRecentOpportunities() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data } = await sb
      .from("opportunities")
      .select("id,title,organization,image_url,category,deadline")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);
    return data ?? [];
  } catch {
    return [];
  }
}

function JsonLd() {
  const t = useTranslations("Home.jsonLd");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Voila",
        url: SITE_URL,
        description: t("organizationDescription"),
        sameAs: [
          "https://twitter.com/Voila",
          "https://linkedin.com/company/Voila",
          "https://instagram.com/Voila",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Voila",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: t("webpageName"),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        description: t("webpageDescription"),
      },
      {
        "@type": "SoftwareApplication",
        name: "Voila",
        applicationCategory: "EducationApplication",
        operatingSystem: "iOS, Android, Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: t("softwareDescription"),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CompassIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#0B6623" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#0B6623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#0B6623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#0B6623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#0B6623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#0B6623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

const FEATURE_ICONS = [
  <CompassIcon key="compass" />,
  <ClipboardIcon key="clipboard" />,
  <DocumentIcon key="document" />,
  <BellIcon key="bell" />,
  <GridIcon key="grid" />,
  <ShieldIcon key="shield" />,
];

// ── Shared ────────────────────────────────────────────────────────────────────

function Eyebrow({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-6">
      {label}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const t = useTranslations("Home.hero");
  return (
    <section className="relative bg-primary text-white overflow-hidden pt-10 pb-8 md:pt-16 md:pb-10">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-white/10 -top-40 -right-28 opacity-40 pointer-events-none" />
      <div className="absolute w-[360px] h-[360px] rounded-full bg-white/10 -bottom-24 -left-16 opacity-30 pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-white/5 top-[30%] left-[40%] pointer-events-none" />

      <div className="relative mx-auto max-w-[1200px] px-6 pt-2 md:pt-4">
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-10 md:gap-16">
          {/* Copy */}
          <div className="flex-1 flex flex-col gap-5 text-center md:text-left items-center md:items-start">
            <div className="self-center md:self-start flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-white text-xs font-semibold tracking-wide">{t("badge")}</span>
            </div>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight">
              {t("titleLine1")}<br />
              <span className="text-surface">{t("titleLine2")}</span>
            </h1>

            <p className="text-white/80 text-lg leading-7 max-w-[520px]">
              {t("subtitle")}
            </p>

            <div id="get-started" className="flex flex-col items-center gap-3 mt-6 sm:flex-row sm:justify-center md:justify-start">
              <a
                href={SIGNUP_URL}
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold text-base px-6 py-3.5 rounded-xl shadow-md transition-all duration-150 min-w-[200px]"
              >
                {t("ctaPrimary")}
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 font-medium text-base transition-all duration-150"
              >
                {t("ctaSecondary")}
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-col items-center gap-3 mt-4 text-center md:flex-row md:items-center md:text-left md:justify-start">
              <div className="flex">
                {["A", "C", "N", "K"].map((initial, i) => (
                  <div
                    key={initial}
                    style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 4 - i, position: "relative" }}
                    className="w-[30px] h-[30px] rounded-full bg-primary border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-white text-[11px] font-bold">{initial}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-sm leading-[1.6] font-medium">
                {t.rich("socialProof", {
                  strong: (chunks) => <span className="text-white font-semibold">{chunks}</span>,
                })}
              </p>
            </div>
          </div>

          {/* Product image */}
          <div className="flex-1 max-w-[460px] w-full mx-auto md:mx-0">
            <div className="relative h-[520px] overflow-hidden rounded-[28px]">
              <Image
                src="/images/product.png"
                alt="Voila app"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trust ─────────────────────────────────────────────────────────────────────

function TrustSection() {
  const t = useTranslations("Home.trust");
  const trustStats = [
    { value: "1K+", label: t("stats.students") },
    { value: "25+", label: t("stats.mentors") },
    { value: "300+", label: t("stats.opportunities") },
    { value: "98%", label: t("stats.satisfaction") },
  ];
  const partners = t.raw("partners") as string[];

  return (
    <section className="bg-white border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <div className="flex justify-center">
          <Eyebrow label={t("eyebrow")} />
        </div>
        <h2 className="text-[#1A1A1A] text-4xl md:text-5xl lg:text-6xl font-bold mb-3 mx-auto">
          {t("title")}
        </h2>
        <p className="text-muted text-lg leading-7 mb-10 mx-auto max-w-[600px]">
          {t("description")}
        </p>
        <div className="flex flex-wrap gap-4">
          {trustStats.map((stat) => (
            <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-10">
          <span className="text-muted text-xs font-semibold uppercase tracking-[0.05em] mr-1">{t("trustedBy")}</span>
          {partners.map((p) => (
            <span key={p} className="px-4 py-1 rounded-full bg-surface-tinted border border-border text-muted text-xs font-semibold">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Recent Opportunities ──────────────────────────────────────────────────────

async function RecentOpportunitiesSection() {
  const t = await getTranslations("Home.recentOpportunities");
  const opportunities = await getRecentOpportunities();
  if (!opportunities.length) return null;

  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 text-center mb-10">
        <div className="flex justify-center">
          <Eyebrow label={t("eyebrow")} />
        </div>
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl font-bold mb-3 mx-auto max-w-[760px]">
          {t("title")}
        </h2>
        <p className="text-muted text-base leading-7 mx-auto max-w-[600px]">
          {t("description")}
        </p>
      </div>
      <OpportunityCarousel opportunities={opportunities} />
      <div className="flex justify-center mt-10 px-6">
        <a
          href={SIGNUP_URL}
          className="inline-flex items-center gap-2 bg-primary hover:bg-forest text-white font-bold text-base px-6 py-3.5 rounded-xl transition-colors duration-150"
        >
          {t("cta")}
          <ArrowIcon className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const t = useTranslations("Home.features");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <Eyebrow label={t("eyebrow")} />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl font-bold mb-3 mx-auto max-w-[760px]">
          {t("title")}
        </h2>
        <p className="text-muted text-base leading-7 mb-12 mx-auto max-w-[640px]">
          {t("description")}
        </p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((feature, i) => (
            <ScrollReveal
              key={feature.title}
              className="rounded-[32px] border border-border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary transition">
                {FEATURE_ICONS[i]}
              </div>
              <h3 className="text-[#1A1A1A] font-semibold text-lg mb-3">{feature.title}</h3>
              <p className="text-muted text-sm leading-7">{feature.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const t = useTranslations("Home.howItWorks");
  const steps = t.raw("steps") as { step: string; title: string; description: string }[];

  return (
    <section id="how-it-works" className="bg-[#F4F7F5] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <Eyebrow label={t("eyebrow")} />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl font-bold mb-3 mx-auto max-w-[760px]">
          {t("title")}
        </h2>
        <p className="text-muted text-base leading-7 mb-12 mx-auto max-w-[640px]">
          {t("description")}
        </p>
        <div className="relative mx-auto max-w-[980px]">
          <div className="absolute left-4 right-4 top-14 hidden h-px bg-primary/20 md:block" />
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} className="relative flex flex-col items-center text-center">
                <div className="absolute inset-x-0 top-0 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>
                <div className="mt-14 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
                  {i === 0 ? (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6" />
                      <path d="M23 11h-6" />
                    </svg>
                  ) : i === 1 ? (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="7" width="18" height="10" rx="2" />
                      <path d="M16 17v2" />
                      <path d="M8 17v2" />
                      <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                    </svg>
                  )}
                </div>
                <div className="mt-6 rounded-[28px] border border-border bg-white px-6 pb-8 pt-10 shadow-sm">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                  <p className="text-muted text-sm leading-7">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Mentorship ────────────────────────────────────────────────────────────────

function MentorshipSection() {
  const t = useTranslations("Home.mentorship");
  const points = t.raw("points") as { title: string; description: string }[];

  return (
    <section className="bg-white py-20 md:py-28">
      <ScrollReveal className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 md:items-center">
          <div className="flex-1 relative rounded-[20px] overflow-hidden min-h-[320px] md:min-h-[400px]">
            <Image src="/images/mentorship.jpg" alt="Mentorship" fill className="object-cover" />
            <div className="absolute inset-0 bg-[rgba(15,32,24,0.3)]" />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(26,61,37,0.9)] border border-[rgba(139,201,154,0.3)]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-xs font-semibold">{t("badge")}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 text-left">
            <div className="flex md:block justify-center">
              <Eyebrow label={t("eyebrow")} />
            </div>
            <h2 className="text-center md:text-left text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl font-bold">
              {t("title")}
            </h2>
            <p className="text-muted text-lg leading-7 mb-2">
              {t("description")}
            </p>
            <div className="flex flex-col gap-4 mt-2">
              {points.map((point) => (
                <div key={point.title} className="flex gap-3 items-start">
                  <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="font-semibold text-base text-[#1A1A1A]">{point.title}</p>
                    <p className="text-muted text-sm leading-[22px]">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/mentor"
              className="self-start mt-4 inline-flex items-center gap-2 bg-primary hover:bg-forest text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-colors duration-150"
            >
               {t("cta")}
              <ArrowIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const t = useTranslations("Home.testimonials");
  const items = t.raw("items") as { quote: string; name: string; role: string }[];

  return (
    <section className="bg-[#F4F7F5] py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 text-center mb-10">
        <div className="flex justify-center">
          <Eyebrow label={t("eyebrow")} />
        </div>
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl font-bold mx-auto">
          {t("title")}
        </h2>
      </div>
      <TestimonialCarousel testimonials={items} />
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FaqSection() {
  const t = useTranslations("Home.faq");
  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <section className="bg-white py-20 md:py-28">
      <ScrollReveal className="mx-auto max-w-[1200px] px-6 text-center">
        <div className="flex justify-center">
          <Eyebrow label={t("eyebrow")} />
        </div>
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl font-bold mb-10 mx-auto">
          {t("title")}
        </h2>
        <div className="mx-auto max-w-[760px] border-t border-border">
          {items.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

// ── CTA Band ──────────────────────────────────────────────────────────────────

function CtaSection() {
  const t = useTranslations("Home.cta");
  return (
    <section className="relative bg-forest py-20 md:py-28 overflow-hidden text-center">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-primary opacity-60 -left-36 -top-24 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent opacity-[0.08] -right-20 -bottom-16 pointer-events-none" />
      <ScrollReveal className="relative mx-auto max-w-[820px] px-6">
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 text-center">
          {t("title")}
        </h2>
        <p className="text-white/65 text-lg leading-7 mb-10">
          {t("description")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <a
            href={SIGNUP_URL}
            className="inline-flex items-center gap-2 bg-white hover:bg-accent text-primary font-bold text-base px-8 py-3.5 rounded-xl shadow-md transition-all duration-150 min-w-[220px] justify-center"
          >
            {t("button")}
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
        </div>
        <p className="text-white/40 text-xs tracking-wide">{t("note")}</p>
      </ScrollReveal>
    </section>
  );
}


export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <Header />
      <main>
        <Hero />
        <TrustSection />
        <RecentOpportunitiesSection />
        <FeaturesSection />
        <HowItWorksSection />
        <MentorshipSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
