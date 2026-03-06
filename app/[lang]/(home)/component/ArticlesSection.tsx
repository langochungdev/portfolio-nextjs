"use client";

import Link from "next/link";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { blogPosts } from "@/lib/mock/blog";
import styles from "@/app/style/home/ArticlesSection.module.css";

export function ArticlesSection() {
  const { dictionary: dict, locale } = useDictionary();
  const recentPosts = blogPosts.slice(0, 5);

  return (
    <section>
      <ul className={styles.articleList}>
        {recentPosts.map((post) => (
          <li key={post.id}>
            <Link href={`/${locale}/blog`} className={styles.articleLink}>
              {post.title[locale]}
              <span className={styles.articleDate}>{post.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
