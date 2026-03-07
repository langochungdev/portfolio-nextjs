"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { LanguageSwitcher } from "@/app/[lang]/_shared/LanguageSwitcher";
import { DarkModeToggle } from "@/app/[lang]/_shared/DarkModeToggle";
import { certificates, certCategories } from "@/lib/mock/certificates";
import { AutoScrollColumn } from "./AutoScrollColumn";
import topStyles from "@/app/style/shared/TopActions.module.css";
import styles from "@/app/style/certificates/page.module.css";

function groupByCategory() {
  const grouped: Record<string, typeof certificates> = {};
  for (const cat of certCategories) {
    const items = certificates.filter((c) => c.category === cat);
    if (items.length > 0) grouped[cat] = items;
  }
  return grouped;
}

export default function CertificatesPage() {
  const { locale, dictionary: dict } = useDictionary();
  const grouped = groupByCategory();
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <div className={styles.container}>
      <div className={topStyles.topActions}>
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>

      <header className={styles.header}>
        <Link href={`/${locale}`} className={styles.backLink}>
          ← {dict.certificates.backHome}
        </Link>
        <h1 className={styles.title}>{dict.certificates.title}</h1>
        <p className={styles.subtitle}>{dict.certificates.subtitle}</p>
      </header>

      <div className={styles.columns}>
        {Object.entries(grouped).map(([category, certs]) => (
          <section key={category} className={styles.column}>
            <h2 className={styles.columnTitle}>
              {dict.certificates.categories[category as keyof typeof dict.certificates.categories]}
            </h2>
            <AutoScrollColumn
              certs={certs}
              locale={locale}
              viewCredentialLabel={dict.certificates.viewCredential}
              onImageClick={openLightbox}
            />
          </section>
        ))}
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
