import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Header from "../components/Header";
import Footer from "../components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function AboutPage() {
  const t = useTranslations("About");
  const cards = t.raw("cards") as { title: string; text: string }[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-[#1A1A1A]">
        <section className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
          <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">{t("eyebrow")}</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted text-lg leading-8 max-w-[760px]">
              {t("intro")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-surface p-8">
              <h2 className="text-2xl font-semibold mb-3">{t("mission.title")}</h2>
              <p className="text-muted leading-7">
                {t("mission.text")}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-8">
              <h2 className="text-2xl font-semibold mb-3">{t("whyItMatters.title")}</h2>
              <p className="text-muted leading-7">
                {t("whyItMatters.text")}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted leading-7">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[32px] bg-[#F4F7F5] p-8">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_#3D7A50,_transparent_40%)]" />
            <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t("builtForStudents.eyebrow")}</p>
                <h2 className="text-3xl font-bold">{t("builtForStudents.title")}</h2>
                <p className="text-muted leading-7">
                  {t("builtForStudents.text")}
                </p>
                <div className="mt-4">
                  <a
                    href="/mentor"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-primary font-medium hover:bg-primary/[0.04] transition-colors duration-150"
                  >
                    {t("builtForStudents.cta")}
                  </a>
                </div>
              </div>
              <div className="relative h-[180px] rounded-[24px] overflow-hidden bg-white shadow-lg">
                <Image src="/images/product.png" alt="Voila app" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
    </>
  );
}
