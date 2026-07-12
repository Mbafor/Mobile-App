import Image from "next/image";
import { useTranslations } from "next-intl";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.voila-africa.com";

export default function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const socialLabels = [t("social.twitter"), t("social.linkedin"), t("social.instagram")];
  const stores = [
    { label: t("stores.googlePlay.label"), sub: t("stores.googlePlay.sub") },
    { label: t("stores.appStore.label"), sub: t("stores.appStore.sub") },
  ];
  const legalLinks = t.raw("columns.legal.links") as string[];
  const legalHrefs = ["/privacy", "/terms", "#"];
  const companyLinks = t.raw("columns.company.links") as string[];
  const companyHrefs = ["#", "#", "#", "#", `${APP_URL}/dashboard?feedback=1`];
  const columns = [
    { heading: t("columns.product.heading"), links: (t.raw("columns.product.links") as string[]).map((label) => ({ label, href: "#" })) },
    { heading: t("columns.company.heading"), links: companyLinks.map((label, i) => ({ label, href: companyHrefs[i] ?? "#" })) },
    { heading: t("columns.legal.heading"), links: legalLinks.map((label, i) => ({ label, href: legalHrefs[i] ?? "#" })) },
  ];

  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap gap-10 justify-between mb-10">
          <div className="flex-[2] min-w-[240px] flex flex-col gap-3">
            <div className="flex items-center mb-1">
              <Image
                src="/images/main_logo.png"
                alt="Voila"
                width={100}
                height={32}
                className="object-contain scale-[1.65]"
              />
            </div>
            <p className="text-muted text-sm leading-[22px] max-w-[280px]">
              {t("tagline")}
            </p>
            <div className="flex gap-2 mt-1">
              {socialLabels.map((label) => (
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
              {stores.map((store) => (
                <button
                  key={store.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors duration-150"
                >
                  <div>
                    <p className="text-[10px] text-muted leading-[14px]">{store.sub}</p>
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-[18px]">{store.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading} className="flex-1 min-w-[130px] flex flex-col gap-3">
              <p className="text-sm font-bold text-[#1A1A1A] tracking-wide mb-1">{col.heading}</p>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted hover:text-primary leading-[22px] transition-colors duration-100"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-wrap justify-between items-center gap-3">
          <p className="text-muted text-sm">{t("copyright", { year })}</p>
          <p className="text-muted text-sm">{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
