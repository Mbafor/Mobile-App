import Image from "next/image";
import Nav from "./components/Nav";
import AnimatedStat from "./components/AnimatedStat";
import FaqItem from "./components/FaqItem";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.olivesforum.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olivesforum.com";
const SIGNUP_URL = `${APP_URL}/welcome`;

function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Olives Forum",
        url: SITE_URL,
        description:
          "Olives Forum matches scholarships, internships, and programs to students' profiles — with mentorship and CV tools in one place.",
        sameAs: [
          "https://twitter.com/olivesforum",
          "https://linkedin.com/company/olivesforum",
          "https://instagram.com/olivesforum",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Olives Forum",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "Olives Forum — Find opportunities. Build your future.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        description:
          "Olives Forum matches scholarships, internships, and programs to your profile — with mentorship and CV tools in one place. Free for African students.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Olives Forum",
        applicationCategory: "EducationApplication",
        operatingSystem: "iOS, Android, Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Find scholarships, internships, mentors and build your CV — all in one place.",
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

// ── Content ───────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Personalised feed",
    description: "Opportunities matched to your academic profile, interests, and career goals — updated as you grow.",
    icon: <CompassIcon />,
  },
  {
    title: "Application tracker",
    description: "Save listings, track deadlines, and manage your pipeline without spreadsheets or scattered notes.",
    icon: <ClipboardIcon />,
  },
  {
    title: "CV builder",
    description: "Build polished CVs with templates, section guidance, and export tools designed for students.",
    icon: <DocumentIcon />,
  },
  {
    title: "Smart notifications",
    description: "Stay ahead of deadlines and mentorship updates with timely alerts across devices.",
    icon: <BellIcon />,
  },
  {
    title: "Category browsing",
    description: "Explore scholarships, internships, fellowships, and more — filtered the way you think.",
    icon: <GridIcon />,
  },
  {
    title: "Secure sign-in",
    description: "Sign in with Google or email OTP — your session syncs securely across web and mobile.",
    icon: <ShieldIcon />,
  },
];

const MENTORSHIP_POINTS = [
  { title: "Coach matching", description: "Get paired with mentors who understand your field and goals." },
  { title: "Session booking", description: "Schedule 1:1 sessions and keep your calendar in sync." },
  { title: "In-app messaging", description: "Chat with your mentor without switching to another tool." },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create profile",
    description: "Add your goals, education, skills and interests so Olives can surface the best matches for you.",
  },
  {
    step: "02",
    title: "Discover mentors & opportunities",
    description: "Explore curated scholarships, internships, fellowships and expert mentors in one place.",
  },
  {
    step: "03",
    title: "Grow your career",
    description: "Apply, track progress, and build a polished CV while getting guidance from experienced mentors.",
  },
];

const TRUST_STATS = [
  { value: "24K+", label: "Students supported" },
  { value: "7.5K+", label: "Mentors onboarded" },
  { value: "15K+", label: "Opportunities listed" },
  { value: "98%", label: "Student satisfaction" },
];

const PARTNERS = ["University networks", "Scholarship boards", "Career centres", "Mentor communities"];

const TESTIMONIALS = [
  {
    quote: '"Olives helped me find a paid internship and connect with a mentor who understood my ambitions."',
    name: "Amina",
    role: "Computer Science student",
  },
  {
    quote: '"The personalised opportunity feed saved me hours of searching and showed me roles I would have missed."',
    name: "Chidi",
    role: "Business student",
  },
  {
    quote: '"I mentor young talent through Olives because the platform makes it easy to share real career advice."',
    name: "Ngozi",
    role: "Career mentor",
  },
];

const FAQS = [
  {
    question: "Is Olives Forum free to use?",
    answer: "Yes! Creating an account, browsing opportunities, and matching with mentors is completely free for students.",
  },
  {
    question: "How does mentor matching work?",
    answer: "We use the profile details you provide (like your field of study and career goals) to suggest mentors who have relevant experience. You can browse suggested coaches and request to connect.",
  },
  {
    question: "Can I track my applications here?",
    answer: "Yes, our built-in tracker lets you save opportunities you discover on the platform and monitor their deadlines and statuses all in one place.",
  },
  {
    question: "Are the CV templates free?",
    answer: "Yes! You can use our CV builder and export your resume using any of our professional templates at no cost.",
  },
];

const AVATAR_BG = ["#1A3D25", "#2D6040", "#3D7A50", "#8BC99A"];

// ── Icons ─────────────────────────────────────────────────────────────────────

function CompassIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A3D25" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A3D25" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A3D25" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A3D25" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A3D25" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="#1A3D25" strokeWidth={1.8}>
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
function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

function Eyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-primary text-xs font-bold tracking-[0.05em] uppercase">{label}</span>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative bg-forest overflow-hidden pb-20 md:pb-32">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#1A3D25] opacity-60 -top-40 -right-28 pointer-events-none" />
      <div className="absolute w-[360px] h-[360px] rounded-full bg-[#2D6040] opacity-30 -bottom-24 -left-16 pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-accent opacity-[0.06] top-[30%] left-[40%] pointer-events-none" />

      <div className="relative mx-auto max-w-[1200px] px-6 pt-16 md:pt-24">
        <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16">
          {/* Copy */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(139,201,154,0.12)] border border-[rgba(139,201,154,0.25)]">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-accent text-xs font-semibold tracking-wide">Built for ambitious students</span>
            </div>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight">
              Find opportunities.<br />
              <span className="text-accent">Build your future.</span>
            </h1>

            <p className="text-white/60 text-lg leading-7 max-w-[520px]">
              Olives Forum matches scholarships, internships, and programs to your profile —
              with mentorship and CV tools in one place.
            </p>

            <div id="get-started" className="flex flex-wrap gap-3 mt-1">
              <a
                href={SIGNUP_URL}
                className="inline-flex items-center gap-2 bg-white hover:bg-primary text-primary hover:text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md transition-all duration-150 min-w-[200px] justify-center"
              >
                Get started free
                <ArrowIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-white/20 hover:border-white/50 hover:bg-white/[0.07] text-white/75 hover:text-white font-medium text-base transition-all duration-150"
              >
                See how it works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex">
                {["A", "C", "N", "K"].map((initial, i) => (
                  <div
                    key={initial}
                    style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 4 - i, position: "relative" }}
                    className="w-[30px] h-[30px] rounded-full bg-[#2D6040] border-2 border-forest flex items-center justify-center"
                  >
                    <span className="text-white text-[11px] font-bold">{initial}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/55 text-xs leading-[18px]">
                Joined by <span className="text-white/85 font-semibold">24,000+</span> students across Africa
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center gap-4 mt-2 pt-4 border-t border-white/10">
              {[
                { value: "Global", label: "Feed" },
                { value: "1:1", label: "Mentorship" },
                { value: "Free", label: "CV Builder" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-4">
                  {i > 0 && <div className="w-px h-8 bg-white/15" />}
                  <div>
                    <p className="text-white text-xl font-bold">{stat.value}</p>
                    <p className="text-white/45 text-xs tracking-wide">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product image */}
          <div className="hidden md:flex flex-1 max-w-[500px] items-center justify-center">
            <Image
              src="/images/product.png"
              alt="Olives Forum app"
              width={500}
              height={560}
              className="w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trust ─────────────────────────────────────────────────────────────────────

function TrustSection() {
  return (
    <section className="bg-white border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Eyebrow label="By the numbers" />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-bold mb-3 max-w-[660px]">
          Real impact for students and early-career professionals.
        </h2>
        <p className="text-muted text-lg leading-7 mb-10 max-w-[600px]">
          Olives connects talent to opportunities, mentorship, and the tools needed to build a stronger career.
        </p>
        <div className="flex flex-wrap gap-4">
          {TRUST_STATS.map((stat) => (
            <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-10">
          <span className="text-muted text-xs font-semibold uppercase tracking-[0.05em] mr-1">Trusted by</span>
          {PARTNERS.map((p) => (
            <span key={p} className="px-4 py-1 rounded-full bg-surface-tinted border border-border text-muted text-xs font-semibold">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Eyebrow label="Features" />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-bold mb-3 max-w-[660px]">
          Everything you need to compete globally
        </h2>
        <p className="text-muted text-lg leading-7 mb-10 max-w-[600px]">
          From discovery to application — stay organised and supported at every step.
        </p>
        <div className="flex flex-wrap gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex-1 basis-[280px] p-6 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-[14px] bg-primary/[0.06] border border-primary/[0.10] flex items-center justify-center mb-1">
                {feature.icon}
              </div>
              <h3 className="text-[#1A1A1A] font-semibold text-[17px]">{feature.title}</h3>
              <p className="text-muted text-sm leading-[22px]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#F4F7F5] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Eyebrow label="How it works" />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-bold mb-10 max-w-[660px]">
          Get matched in three simple steps.
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="flex flex-col md:flex-row flex-1 items-stretch">
              <div className="flex-1 p-6 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-[14px] bg-primary flex items-center justify-center mb-1">
                  <span className="text-white text-sm font-extrabold tracking-wide">{step.step}</span>
                </div>
                <h3 className="text-[#1A1A1A] font-semibold text-[17px]">{step.title}</h3>
                <p className="text-muted text-sm leading-[22px]">{step.description}</p>
              </div>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:flex items-center px-2 text-accent">
                  <ArrowIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Mentorship ────────────────────────────────────────────────────────────────

function MentorshipSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 md:items-center">
          <div className="flex-1 relative rounded-[20px] overflow-hidden min-h-[320px] md:min-h-[400px]">
            <Image src="/images/mentorship.jpg" alt="Mentorship" fill className="object-cover" />
            <div className="absolute inset-0 bg-[rgba(15,32,24,0.3)]" />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(26,61,37,0.9)] border border-[rgba(139,201,154,0.3)]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-xs font-semibold">1:1 Mentorship</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <Eyebrow label="Mentorship" />
            <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-bold max-w-[660px]">
              Guidance from people who have been there
            </h2>
            <p className="text-muted text-lg leading-7 max-w-[600px] mb-2">
              Connect with coaches, book sessions, and track your mentorship journey without leaving the platform.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              {MENTORSHIP_POINTS.map((point) => (
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
              href={SIGNUP_URL}
              className="self-start mt-4 inline-flex items-center gap-2 bg-primary hover:bg-forest text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-colors duration-150"
            >
              Explore mentorship
              <ArrowIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="bg-[#F4F7F5] py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Eyebrow label="Success stories" />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-bold mb-10 max-w-[660px]">
          Students and mentors finding momentum together.
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex-1 p-8 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
              </div>
              <p className="text-[#1A1A1A] text-base leading-[26px] italic flex-1">{t.quote}</p>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: AVATAR_BG[t.name.charCodeAt(0) % AVATAR_BG.length] }}
                >
                  <span className="text-white font-bold text-base">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A] text-base">{t.name}</p>
                  <p className="text-muted text-sm mt-px">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FaqSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <Eyebrow label="FAQ" />
        <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-bold mb-10 max-w-[660px]">
          Got questions? We&apos;ve got answers.
        </h2>
        <div className="max-w-[800px] border-t border-border">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Band ──────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="relative bg-forest py-20 md:py-28 overflow-hidden text-center">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-primary opacity-60 -left-36 -top-24 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent opacity-[0.08] -right-20 -bottom-16 pointer-events-none" />
      <div className="relative mx-auto max-w-[820px] px-6">
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-3">
          Ready to find your next opportunity?
        </h2>
        <p className="text-white/65 text-lg leading-7 mb-10">
          Join Olives Forum and start with a personalised feed in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <a
            href={SIGNUP_URL}
            className="inline-flex items-center gap-2 bg-white hover:bg-accent text-primary font-bold text-base px-8 py-3.5 rounded-xl shadow-md transition-all duration-150 min-w-[220px] justify-center"
          >
            Get started — it&apos;s free
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
        </div>
        <p className="text-white/40 text-xs tracking-wide">No credit card required · Free for students</p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap gap-10 justify-between mb-10">
          <div className="flex-[2] min-w-[240px] flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-forest flex items-center justify-center">
                <span className="text-accent text-base font-bold">O</span>
              </div>
              <span className="text-[#1A1A1A] font-bold text-lg">Olives Forum</span>
            </div>
            <p className="text-muted text-sm leading-[22px] max-w-[280px]">
              Building career confidence for African students and young professionals.
            </p>
            <div className="flex gap-2 mt-1">
              {["Twitter", "LinkedIn", "Instagram"].map((label) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors duration-150 text-xs font-semibold"
                >
                  {label[0]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[{ label: "Google Play", sub: "Get it on" }, { label: "App Store", sub: "Download on" }].map((store) => (
                <button key={store.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors duration-150">
                  <div>
                    <p className="text-[10px] text-muted leading-[14px]">{store.sub}</p>
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-[18px]">{store.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {[
            { heading: "Product", links: ["Opportunities", "Mentorship", "CV Builder", "Tracker", "Notifications"] },
            { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.heading} className="flex-1 min-w-[130px] flex flex-col gap-3">
              <p className="text-sm font-bold text-[#1A1A1A] tracking-wide mb-1">{col.heading}</p>
              {col.links.map((link) => (
                <a key={link} href="#" className="text-sm text-muted hover:text-primary leading-[22px] transition-colors duration-100">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-wrap justify-between items-center gap-3">
          <p className="text-muted text-sm">© {year} Olives Forum. All rights reserved.</p>
          <p className="text-muted text-sm">Made with care for African students 🌿</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <Nav />
      <main>
        <Hero />
        <TrustSection />
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
