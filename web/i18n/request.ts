import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

import { defaultLocale, isSupportedLocale, LOCALE_COOKIE, type AppLocale } from "./locales";

/** Mirrors src/i18n/detect-language.ts on mobile: French if requested, English otherwise. */
function detectFromAcceptLanguage(header: string | null): AppLocale {
  const preferred = header?.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  return preferred === "fr" ? "fr" : defaultLocale;
}

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : detectFromAcceptLanguage(headerStore.get("accept-language"));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
