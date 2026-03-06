"use client";

import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { LanguageSwitcher } from "@/app/[lang]/_shared/LanguageSwitcher";
import { ArticlesSection } from "./component/ArticlesSection";
import { SocialSection } from "./component/SocialSection";
import { GithubSection } from "./component/GithubSection";
import { PortraitSection } from "./component/PortraitSection";
import { NavBar } from "./component/NavBar";
import { ProjectsSection } from "./component/ProjectsSection";
import styles from "@/app/style/page.module.css";

export default function HomePage() {
  const { dictionary: dict } = useDictionary();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <LanguageSwitcher />
        </div>
        <h1 className={styles.title}>La Ngọc Hưng</h1>
        <p className={styles.subtitle}>{dict.home.subtitle}</p>
      </header>

      <div className={styles.grid}>
        <aside className={styles.leftColumn}>
          <ArticlesSection />
          <div className={styles.leftBottom}>
            <SocialSection />
            <GithubSection />
          </div>
        </aside>

        <main className={styles.centerColumn}>
          <PortraitSection />
          <NavBar />
        </main>

        <ProjectsSection />
      </div>
    </div>
  );
}
