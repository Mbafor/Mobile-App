import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voila-africa.com').replace(/\/$/, '');
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.voila-africa.com').replace(/\/$/, '');
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

type Params = { id: string };

type OpportunityRow = {
  id: string;
  title: string;
  description: string | null;
  organization: string;
  image_url: string | null;
  category: string | null;
  country: string | null;
  deadline: string;
  location_type: string | null;
  funding_type: string | null;
};

async function getOpportunity(id: string): Promise<OpportunityRow | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data } = await sb
      .from('opportunities')
      .select('id,title,description,organization,image_url,category,country,deadline,location_type,funding_type')
      .eq('id', id)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const opp = await getOpportunity(id);

  if (!opp) {
    return {
      title: 'Opportunity | Voila',
      description: 'Discover scholarships, internships and fellowships on Voila.',
    };
  }

  const title = `${opp.title} | Voila`;
  const rawDesc = opp.description?.trim() ?? '';
  const description = rawDesc
    ? rawDesc.length > 155
      ? `${rawDesc.slice(0, 152)}...`
      : rawDesc
    : `Apply for ${opp.title} by ${opp.organization} on Voila.`;
  const image = opp.image_url || DEFAULT_OG_IMAGE;
  const url = `${SITE_URL}/opportunity/${id}`;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: opp.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

function CalendarIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  const now = new Date();
  const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Deadline today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const opp = await getOpportunity(id);
  const appLink = `${APP_URL}/opportunity/${id}`;
  const signupLink = `${APP_URL}/welcome`;

  if (!opp) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#F4F7F5] flex items-center justify-center px-6">
          <div className="text-center py-20 max-w-[480px]">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Opportunity not found</h1>
            <p className="text-muted mb-8 leading-7">
              This opportunity may have expired or been removed. Browse thousands of open scholarships,
              internships and fellowships on Voila.
            </p>
            <a
              href={signupLink}
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#0a5a1e] transition-colors duration-150"
            >
              Browse opportunities
              <ArrowIcon />
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const deadlineLabel = formatDeadline(opp.deadline);
  const isExpired = deadlineLabel === 'Deadline passed';

  const metaParts = [
    opp.category,
    opp.country,
    opp.location_type,
    opp.funding_type,
  ].filter(Boolean) as string[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F4F7F5]">
        {/* Hero */}
        {opp.image_url ? (
          <div className="w-full h-52 md:h-72 overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={opp.image_url}
              alt={opp.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
          </div>
        ) : (
          <div className="w-full h-40 md:h-52 bg-primary flex items-center justify-center">
            <span className="text-white font-bold opacity-80" style={{ fontSize: 72, lineHeight: 1 }}>
              {opp.organization.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Content card */}
        <div className="mx-auto max-w-[860px] px-4 sm:px-6 pb-16 -mt-6 relative">
          <div className="bg-white rounded-3xl shadow-sm border border-[#E5EBE8] p-6 sm:p-10">
            {/* Meta chips */}
            {metaParts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {metaParts.map((part) => (
                  <span
                    key={part}
                    className="px-3 py-1 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-semibold capitalize"
                  >
                    {part}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-[#1A1A1A] text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight leading-tight mb-2">
              {opp.title}
            </h1>

            <p className="text-muted text-base font-medium mb-4">{opp.organization}</p>

            {/* Deadline badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-6 ${
                isExpired
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-primary/5 text-primary border border-primary/15'
              }`}
            >
              <CalendarIcon />
              {deadlineLabel}
            </div>

            <div className="h-px bg-[#E5EBE8] mb-6" />

            {/* Description */}
            {opp.description?.trim() && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">About this opportunity</h2>
                <p className="text-[#1A1A1A] leading-8 whitespace-pre-line">{opp.description.trim()}</p>
              </div>
            )}

            <div className="h-px bg-[#E5EBE8] mb-6" />

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={appLink}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#0a5a1e] text-white font-bold text-base px-6 py-3.5 rounded-xl transition-colors duration-150"
              >
                Apply on Voila
                <ArrowIcon />
              </a>
              <a
                href={signupLink}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-[#E5EBE8] bg-white hover:bg-[#F4F7F5] text-[#1A1A1A] font-semibold text-base px-6 py-3.5 rounded-xl transition-colors duration-150"
              >
                Join Voila free
              </a>
            </div>

            <p className="text-center text-muted text-sm mt-4">
              New to Voila? Join free — access 15,000+ opportunities personalised to your profile.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
