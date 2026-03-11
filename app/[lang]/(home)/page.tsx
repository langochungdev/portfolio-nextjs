import { getDictionary } from "@/lib/i18n/getDictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { fetchContributions } from "@/lib/content/github";
import { PageViewTracker } from "@/app/[lang]/_shared/PageViewTracker";
import { ArticlesSection } from "./component/ArticlesSection";
import { SocialSection } from "./component/SocialSection";
import { GithubSection } from "./component/GithubSection";
import { PortraitSection } from "./component/PortraitSection";
import { ProjectsSection } from "./component/ProjectsSection";
import { PrefetchBlog } from "./component/PrefetchBlog";
import styles from "@/app/style/home/page.module.css";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = i18nConfig.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18nConfig.defaultLocale;
  const dict = await getDictionary(locale);

  let githubData = null;
  try {
    githubData = await fetchContributions("langochungdev");
  } catch { /* GitHub API unavailable */ }

  return (
    <div className={styles.container}>
      <PageViewTracker page="home" />
      <PrefetchBlog locale={locale} />
      <header className={styles.header}>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>La Ngọc Hùng</h1>
          <p className={styles.subtitle}>{dict.home.subtitle}</p>
        </div>
      </header>

      <div className={styles.grid}>
        <aside className={styles.leftColumn}>
          <ArticlesSection locale={locale} />
          <div className={styles.leftBottom}>
            <SocialSection />
            <GithubSection data={githubData} />
          </div>
        </aside>

        <main className={styles.centerColumn}>
          <PortraitSection />
        </main>

        <section className={styles.rightColumn}>
          <ProjectsSection />
        </section>
      </div>
    </div>
  );
}
