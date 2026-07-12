"use client";

import { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Header from "../components/Header";
import Footer from "../components/Footer";

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function MentorPage() {
  const t = useTranslations('Mentor');
  const whatToExpect = t.raw('whatToExpect') as { title: string; description: string }[];
  const responsibilities = t.raw('responsibilities') as string[];
  const expertiseOptions = t.raw('form.expertiseOptions') as string[];
  const experienceOptions = t.raw('form.experienceOptions') as string[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F4F7F5] text-[#1A1A1A]">
        {/* Hero */}
        <section className="bg-primary text-white py-16 md:py-24">
          <div className="mx-auto max-w-[860px] px-6 text-center">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              {t('hero.eyebrow')}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
              {t('hero.title')}
            </h1>
            <p className="text-white/80 text-lg leading-8 max-w-[600px] mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* What to expect */}
        <section className="py-12 md:py-16 bg-white border-b border-[#E0E0E0]">
          <div className="mx-auto max-w-[860px] px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {whatToExpect.map((item) => (
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
                {t('instructions.eyebrow')}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('instructions.title')}</h2>
              <p className="text-[#6B6B6B] leading-7 mb-6">
                {t('instructions.description')}
              </p>
              <p className="font-semibold text-sm mb-3">{t('instructions.whatYoullDo')}</p>
              <ul className="flex flex-col gap-2.5">
                {responsibilities.map((item) => (
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
                  if (!res.ok) throw new Error(json?.error || t('form.errorFallback'));
                  form.reset();
                  alert(t('form.successAlert'));
                } catch (err) {
                  alert((err as Error).message || t('form.errorFallback'));
                } finally {
                  if (submitBtn) submitBtn.disabled = false;
                }
              }}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                  {t('form.eyebrow')}
                </p>
                <p className="text-sm text-[#6B6B6B] leading-6">
                  {t('form.helper')}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.firstName')}</span>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.lastName')}</span>
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
                  <span className="font-semibold">{t('form.email')}</span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.phone')}</span>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.linkedin')}</span>
                  <input
                    type="text"
                    name="linkedin"
                    placeholder={t('form.linkedinPlaceholder')}
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.portfolio')}</span>
                  <input
                    type="text"
                    name="portfolio"
                    placeholder={t('form.portfolioPlaceholder')}
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.areaOfExpertise')}</span>
                  <select
                    name="area_of_expertise"
                    required
                    defaultValue=""
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="" disabled>{t('form.selectPlaceholder')}</option>
                    {expertiseOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold">{t('form.yearsOfExperience')}</span>
                  <select
                    name="years_of_experience"
                    required
                    defaultValue=""
                    className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="" disabled>{t('form.selectPlaceholder')}</option>
                    {experienceOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">{t('form.shortBio')}</span>
                <textarea
                  name="short_bio"
                  required
                  rows={4}
                  className="w-full rounded-3xl border border-[#E0E0E0] bg-[#F4F7F5] px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold">{t('form.motivation')}</span>
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
                  {t('form.submit')}
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
