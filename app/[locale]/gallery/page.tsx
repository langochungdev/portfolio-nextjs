import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import GalleryWindow from "@/components/gallery/GalleryWindow";
import GalleryFilter from "@/components/gallery/GalleryFilter";

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (i18nConfig.locales.includes(rawLocale as Locale) ? rawLocale : i18nConfig.defaultLocale) as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="gallery-wrapper">
      <GalleryWindow dict={dict} locale={locale} />
      <GalleryFilter dict={dict} />
    </div>
  );
}
