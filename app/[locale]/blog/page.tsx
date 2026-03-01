import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import PostsWindow from "@/components/blog/PostsWindow";
import BlogSidebar from "@/components/blog/BlogSidebar";

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (i18nConfig.locales.includes(rawLocale as Locale) ? rawLocale : i18nConfig.defaultLocale) as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="blog-wrapper">
      <PostsWindow dict={dict} locale={locale} />
      <BlogSidebar dict={dict} locale={locale} />
    </div>
  );
}
