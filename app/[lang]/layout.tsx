import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "./_shared/DictionaryProvider";
import { NavBar } from "./_shared/NavBar";
import { i18nConfig } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return i18nConfig.locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = i18nConfig.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18nConfig.defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <DictionaryProvider dictionary={dictionary} locale={locale}>
          {children}
          <NavBar />
        </DictionaryProvider>
      </body>
    </html>
  );
}
