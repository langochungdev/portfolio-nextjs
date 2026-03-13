export const i18nConfig = {
  locales: ["vi", "en"] as const,
  defaultLocale: "vi" as const,
};

export const localeCookieName = "site-locale";

export type Locale = (typeof i18nConfig.locales)[number];
