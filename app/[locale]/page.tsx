import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import ProfileWindow from "@/components/home/ProfileWindow";
import ProjectsWindow from "@/components/home/ProjectsWindow";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (i18nConfig.locales.includes(rawLocale as Locale) ? rawLocale : i18nConfig.defaultLocale) as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="home-wrapper">
      <ProfileWindow dict={dict} />
      <ProjectsWindow dict={dict} locale={locale} />
    </div>
  );
}
