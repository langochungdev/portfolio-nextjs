export const i18nConfig = {
  locales: ["vi", "en"] as const,
  defaultLocale: "vi" as const,
};

export type Locale = (typeof i18nConfig.locales)[number];
