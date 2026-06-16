import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About — Voila",
  description: "Learn more about Voila's mission, approach, and support for students.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-[#1A1A1A]">
        <section className="mx-auto max-w-[960px] px-6 py-16 md:py-20">
          <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">About Voila</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">A career platform built for African students.</h1>
            <p className="text-muted text-lg leading-8 max-w-[760px]">
              Voila helps students discover scholarships, internships, fellowships, mentorship and CV tools in one place.
              We bring personalised opportunity matching, application tracking, and guided career support to ambitious learners across Africa.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-surface p-8">
              <h2 className="text-2xl font-semibold mb-3">Our mission</h2>
              <p className="text-muted leading-7">
                To close the gap between students and global opportunities by making discovery, applications, and mentorship simple, reliable, and accessible.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-8">
              <h2 className="text-2xl font-semibold mb-3">Why it matters</h2>
              <p className="text-muted leading-7">
                Many talented students miss out because opportunities are scattered across sites and follow-up is hard. Voila brings those experiences together so students can move forward with confidence.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Personalised discovery",
                text: "We match opportunities to a student’s profile so they see listings that matter most.",
              },
              {
                title: "Track every step",
                text: "Save listings, monitor deadlines, and keep notes without switching between docs and email.",
              },
              {
                title: "Mentorship support",
                text: "Connect with coaches who help students make better decisions and submit stronger applications.",
              },
            ].map((item) => (
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
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Built for students</p>
                <h2 className="text-3xl font-bold">Designed to help you go from discovery to application.</h2>
                <p className="text-muted leading-7">
                  Whether you are searching for scholarships, internships, or career mentorship, Voila brings the tools and recommendations into one workflow.
                </p>
                <div className="mt-4">
                  <a
                    href="/mentor"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-primary font-medium hover:bg-primary/[0.04] transition-colors duration-150"
                  >
                    View our mentors
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
