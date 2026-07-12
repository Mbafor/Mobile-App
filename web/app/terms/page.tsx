import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument } from "../components/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TermsOfService");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function TermsPage() {
  return <LegalDocument namespace="TermsOfService" />;
}
