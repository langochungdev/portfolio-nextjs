import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import Taskbar from "@/components/shared/Taskbar";

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (i18nConfig.locales.includes(rawLocale as Locale) ? rawLocale : i18nConfig.defaultLocale) as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <div className="desktop">{children}</div>
      <Taskbar dict={dict} locale={locale} />
    </>
  );
}
