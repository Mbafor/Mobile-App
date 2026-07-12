import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument } from "../components/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PrivacyPolicy");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function PrivacyPage() {
  return <LegalDocument namespace="PrivacyPolicy" />;
}
