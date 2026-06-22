"use client";

import { FormEvent } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const RESPONSIBILITIES = [
  "Provide mentorship and career advice to students.",
  "Review CVs, applications, and scholarship projects.",
  "Help mentees set goals and track progress.",
  "Share practical experience from your field.",
];

const WHAT_TO_EXPECT = [
  { title: "Flexible commitment", description: "Mentor on your own schedule — book sessions when it suits you." },
  { title: "Matched students", description: "We pair you with students based on your expertise and their goals." },
  { title: "In-app tools", description: "Everything you need — messaging, calendar, and session links — in one place." },
];

export default function MentorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F4F7F5] text-[#1A1A1A]">
        {/* Hero */}
        <section className="bg-primary text-white py-16 md:py-24">
          <div className="mx-auto max-w-[860px] px-6 text-center">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              Mentor network
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
              Become a mentor on Voila
            </h1>
            <p className="text-white/80 text-lg leading-8 max-w-[600px] mx-auto">
              Share your experience, guide ambitious students, and make a real difference — one session at a time.
            </p>
          </div>
        </section>

        {/* What to expect */}
        <section className="py-12 md:py-16 bg-white border-b border-[#E0E0E0]">
          <div className="mx-auto max-w-[860px] px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {WHAT_TO_EXPECT.map((item) => (
                <div key={item.title} className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[#1A1A1A]">{item.title}</p>
                  <p className="text-sm text-[#6B6B6B] leading-6">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application section */}
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-[860px] px-6 flex flex-col gap-6">

            {/* Instructions card */}
            <div className="rounded-[28px] border border-[#E0E0E0] bg-white p-8 shadow-sm">
              <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                Before you apply
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Instructor Application</h2>
              <p className="text-[#6B6B6B] leading-7 mb-6">
                Apply to join our mentor community and help students navigate scholarships, internships, and career growth.
                We review every application and reach out within 5–7 business days.
              </p>
              <p className="font-semibold text-sm mb-3">What you'll do</p>
              <ul className="flex flex-col gap-2.5">
                {RESPONSIBILITIES.map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    <span className="text-sm text-[#6B6B6B] leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application form */}
            <form
              className="rounded-[28px] border border-[#E0E0E0] bg-white p-8 shadow-sm space-y-5"
              onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const payload = Object.fromEntries(fd.entries());

                const submitBtn = form.querySelector('button[type=submit]') as HTMLButtonElement | null;
                if (submitBtn) submitBtn.disabled = true;

                try {
                  const res = await fetch('/api/mentor/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json?.error || 'Submission failed');
                  form.reset();
                  alert('Application submitted — we will review and be in touch.');
                } catch (err) {
                  alert((err as Error).message || 'Submission failed');
                } finally {
                  if (submitBtn) submitBtn.disabled = false;
                }
              }}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                  Your details
                </p>
                <p className="text-sm text-[#6B6B6B] leading-6">
                  Fill in your details below and we'll review your mentor application.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">First name*</span>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">Last name*</span>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">Email*</span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">LinkedIn</span>
                  <input
                    type="text"
                    name="linkedin"
                    placeholder="linkedin.com/in/yourname or any link"
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">Portfolio or website</span>
                  <input
                    type="text"
                    name="portfolio"
                    placeholder="yourportfolio.com or any link"
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">Area of expertise*</span>
                  <select
                    name="area_of_expertise"
                    required
                    defaultValue=""
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="" disabled>Select…</option>
                    <option>Career strategy</option>
                    <option>Scholarships</option>
                    <option>Internships</option>
                    <option>CV & applications</option>
                    <option>Leadership</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">Years of experience*</span>
                  <select
                    name="years_of_experience"
                    required
                    defaultValue=""
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="" disabled>Select…</option>
                    <option>1–3 years</option>
                    <option>3–5 years</option>
                    <option>5–10 years</option>
                    <option>10+ years</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">Short bio*</span>
                <textarea
                  name="short_bio"
                  required
                  rows={4}
                  className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">Why do you want to become a mentor?*</span>
                <textarea
                  name="motivation"
                  required
                  rows={4}
                  className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center justify-center rounded-3xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0a5a1e] active:scale-95"
                >
                  Submit application
                </button>
              </div>
            </form>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
