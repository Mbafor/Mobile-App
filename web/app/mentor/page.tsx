import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MentorPage from "./mentor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MentorMeta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function MentorRoutePage() {
  return <MentorPage />;
}
