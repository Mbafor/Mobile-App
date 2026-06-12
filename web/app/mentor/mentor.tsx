"use client";

import Image from "next/image";
import { FormEvent } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";

const MENTORS = [
  {
    name: "Aisha Bello",
    role: "Scholarships & Career Mentor",
    expertise: "Scholarship applications, CV strategy, interview prep",
    location: "Lagos, Nigeria",
    description:
      "Aisha helps students polish applications and land global scholarships with confidence.",
  },
  {
    name: "Emeka Okoro",
    role: "Internship Coach",
    expertise: "Internship search, resume review, career planning",
    location: "Abuja, Nigeria",
    description:
      "Emeka supports learners through every step of their internship journey.",
  },
  {
    name: "Fatima Abubakar",
    role: "CV & Interview Mentor",
    expertise: "CV building, personal branding, interview coaching",
    location: "Kano, Nigeria",
    description:
      "Fatima helps students tell their story clearly and confidently to recruiters.",
  },
  {
    name: "Samuel Ndlovu",
    role: "Tech Career Mentor",
    expertise: "Software internships, career transitions, mentorship",
    location: "Nairobi, Kenya",
    description:
      "Samuel guides emerging tech talent from applications to career growth.",
  },
  {
    name: "Nkechi Chukwu",
    role: "Entrepreneurship Mentor",
    expertise: "Startup mentorship, funding applications, business planning",
    location: "Accra, Ghana",
    description:
      "Nkechi helps students turn ideas into opportunities with practical advice.",
  },
  {
    name: "Kofi Mensah",
    role: "Leadership & Impact Mentor",
    expertise: "Leadership development, fellowship preparation",
    location: "Kumasi, Ghana",
    description:
      "Kofi works with students who want to grow their leadership potential.",
  },
];

function MentorCard({ mentor }: { mentor: (typeof MENTORS)[number] }) {
  return (
    <article className="rounded-[28px] border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-4 mb-5">
        <div className="h-14 w-14 rounded-3xl bg-forest/10 text-forest grid place-items-center text-lg font-bold">
          {mentor.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">{mentor.name}</h3>
          <p className="text-sm text-muted">{mentor.role}</p>
        </div>
      </div>
      <p className="text-sm text-[#1A1A1A] font-semibold mb-3">{mentor.expertise}</p>
      <p className="text-sm leading-7 text-muted mb-4">{mentor.description}</p>
      <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">{mentor.location}</div>
    </article>
  );
}

export default function MentorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-[#1A1A1A]">
        <section className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
        <div className="max-w-[820px] text-center mx-auto mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-3">
            Mentor network
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Meet mentors ready to guide ambitious students.
          </h1>
          <p className="text-muted text-lg leading-8">
            Browse a sample of our mentor community. If you want to become a mentor, complete the application on the right.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MENTORS.map((mentor) => (
            <MentorCard key={mentor.name} mentor={mentor} />
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-start rounded-[32px] border border-border bg-surface p-8">
          <div className="space-y-6 rounded-[28px] border border-border bg-white p-8 shadow-sm">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                Title and responsibilities
              </p>
              <h2 className="text-3xl font-bold mb-3">Instructor Application</h2>
              <p className="text-muted leading-7">
                Apply to join our mentor community and help students navigate scholarships, internships, and career growth.
              </p>
            </div>

            <div className="space-y-4 text-sm leading-7 text-[#1A1A1A]">
              <p className="font-semibold">What you’ll do</p>
              <ul className="list-disc list-inside space-y-2 text-muted">
                <li>Provide mentorship and career advice to students.</li>
                <li>Review CVs, applications, and scholarship projects.</li>
                <li>Help mentees set goals and track progress.</li>
                <li>Share practical experience from your field.</li>
              </ul>
            </div>
          </div>

          <form
            className="space-y-5 rounded-[28px] border border-border bg-white p-8 shadow-sm"
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Instructor Application
              </p>
              <p className="text-sm text-muted leading-6">
                Fill in your details below and we’ll review your mentor application.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-semibold">First name*</span>
                <input
                  type="text"
                  name="first_name"
                  required
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Last name*</span>
                <input
                  type="text"
                  name="last_name"
                  required
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
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
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-semibold">LinkedIn</span>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Portfolio or website</span>
                <input
                  type="url"
                  name="portfolio"
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
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
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  <option value="" disabled>
                    Select…
                  </option>
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
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  <option>1–3 years</option>
                  <option>3–5 years</option>
                  <option>5–10 years</option>
                  <option>10+ years</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Short bio*</span>
                <textarea
                  name="short_bio"
                  required
                  rows={4}
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold">Why want to become a mentor*</span>
                <textarea
                  name="motivation"
                  required
                  rows={4}
                  className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-forest"
            >
              Submit application
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
    </>
  );
}
