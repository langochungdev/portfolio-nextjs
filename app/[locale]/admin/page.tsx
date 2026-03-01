import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import ContentManager from "@/components/admin/ContentManager";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (i18nConfig.locales.includes(rawLocale as Locale) ? rawLocale : i18nConfig.defaultLocale) as Locale;
  const dict = await getDictionary(locale);

  return (
    <AdminLayoutClient
      dict={dict}
      contentManager={<ContentManager dict={dict} />}
    />
  );
}
