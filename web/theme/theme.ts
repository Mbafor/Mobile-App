export const themes = ["light", "dark"] as const;
export type AppTheme = (typeof themes)[number];
export const defaultTheme: AppTheme = "light";
export const THEME_COOKIE = "NEXT_THEME";

export function isSupportedTheme(value: string | undefined): value is AppTheme {
  return value === "light" || value === "dark";
}
