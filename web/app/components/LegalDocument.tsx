import { useTranslations } from "next-intl";
import Header from "./Header";
import Footer from "./Footer";

type LegalListItem = string | { lead?: string; text: string; subItems?: string[] };

type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: LegalListItem[] }
  | { type: "contact"; email: string; address: string };

type LegalSection = { heading: string; blocks: LegalBlock[] };

function ListItem({ item }: { item: LegalListItem }) {
  if (typeof item === "string") {
    return <li className="text-muted leading-7">{item}</li>;
  }
  return (
    <li className="text-muted leading-7">
      {item.lead ? <strong className="text-[#1A1A1A] font-semibold">{item.lead}</strong> : null}
      {item.lead ? " — " : null}
      {item.text}
      {item.subItems ? (
        <ul className="list-[circle] pl-5 mt-2 space-y-1">
          {item.subItems.map((sub) => (
            <li key={sub} className="text-muted leading-7">{sub}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Block({ block }: { block: LegalBlock }) {
  const legalT = useTranslations("Legal");

  if (block.type === "paragraph") {
    return <p className="text-muted leading-7 mb-4">{block.text}</p>;
  }
  if (block.type === "subheading") {
    return <h3 className="font-semibold text-[#1A1A1A] mt-4 mb-2">{block.text}</h3>;
  }
  if (block.type === "list") {
    return (
      <ul className="list-disc pl-5 space-y-2 mb-4">
        {block.items.map((item, i) => (
          <ListItem key={typeof item === "string" ? item : `${item.lead ?? ""}-${i}`} item={item} />
        ))}
      </ul>
    );
  }
  return (
    <p className="text-muted leading-7 mb-4">
      <strong className="text-[#1A1A1A] font-semibold">{legalT("emailLabel")}:</strong> {block.email}
      <br />
      <strong className="text-[#1A1A1A] font-semibold">{legalT("addressLabel")}:</strong> {block.address}
    </p>
  );
}

export function LegalDocument({ namespace }: { namespace: "PrivacyPolicy" | "TermsOfService" }) {
  const t = useTranslations(namespace);
  const sections = t.raw("sections") as LegalSection[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-[#1A1A1A]">
        <section className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
          <div className="space-y-2 mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted text-sm">{t("lastUpdated")}</p>
          </div>
          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-2xl font-semibold mb-3">{section.heading}</h2>
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
