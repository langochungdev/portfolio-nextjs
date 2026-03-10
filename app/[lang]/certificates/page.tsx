"use client";

import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  certificates,
  certCategories,
  certCollectionColors,
} from "@/lib/mock/certificates";
import type { Certificate } from "@/lib/mock/certificates";
import styles from "@/app/style/certificates/page.module.css";


function groupByCategory(certs: Certificate[]) {
  const groups: Record<string, Certificate[]> = {};
  for (const cert of certs) {
    if (!groups[cert.category]) groups[cert.category] = [];
    groups[cert.category].push(cert);
  }
  return groups;
}

export default function CertificatesPage() {
  const { locale, dictionary: dict } = useDictionary();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const grouped = useMemo(() => groupByCategory(certificates), []);

  const visibleGroups = useMemo(() => {
    if (activeCategory === "all") {
      return certCategories
        .filter((cat) => grouped[cat]?.length)
        .map((cat) => ({ key: cat, certs: grouped[cat] }));
    }
    const certs = grouped[activeCategory];
    return certs?.length ? [{ key: activeCategory, certs }] : [];
  }, [activeCategory, grouped]);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}`} className={styles.wordmark}>
          langochung
        </Link>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>Collections</div>
          <button
            className={`${styles.collectionItem} ${activeCategory === "all" ? styles.collectionItemActive : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <span className={styles.collectionDot} style={{ background: "#1C1C1A" }} />
            <span className={styles.collectionName}>{dict.certificates.title}</span>
            <span className={styles.collectionBadge}>{certificates.length}</span>
          </button>
          {certCategories.map((cat) => {
            const count = grouped[cat]?.length ?? 0;
            if (!count) return null;
            return (
              <button
                key={cat}
                className={`${styles.collectionItem} ${activeCategory === cat ? styles.collectionItemActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className={styles.collectionDot} style={{ background: certCollectionColors[cat] }} />
                <span className={styles.collectionName}>
                  {dict.certificates.categories[cat as keyof typeof dict.certificates.categories]}
                </span>
                <span className={styles.collectionBadge}>{count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <nav className={styles.pillStrip}>
        <button
          className={`${styles.pill} ${activeCategory === "all" ? styles.pillActive : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          <span className={styles.pillDot} style={{ background: "#1C1C1A" }} />
          {dict.certificates.title}
        </button>
        {certCategories.map((cat) => {
          const count = grouped[cat]?.length ?? 0;
          if (!count) return null;
          return (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className={styles.pillDot} style={{ background: certCollectionColors[cat] }} />
              {dict.certificates.categories[cat as keyof typeof dict.certificates.categories]}
            </button>
          );
        })}
      </nav>

      <main className={styles.main}>
        {visibleGroups.map(({ key, certs }, blockIdx) => {
          const catLabel =
            dict.certificates.categories[key as keyof typeof dict.certificates.categories] ?? key;
          const color = certCollectionColors[key] ?? "#1C1C1A";

          return (
            <section
              key={key}
              className={styles.collectorBlock}
              style={{ animationDelay: `${blockIdx * 0.07}s` }}
            >
              <div className={styles.collectorHeader}>
                <span className={styles.collectorDot} style={{ background: color }} />
                <h2 className={styles.collectorTitle}>{catLabel}</h2>
                <span className={styles.collectorMeta}>
                  {certs.length} certs
                </span>
              </div>

              <div className={styles.certGrid}>
                {certs.map((cert) => (
                  <div key={cert.id} className={styles.card}>
                    <div
                      className={styles.cardImage}
                      onClick={() => openLightbox(cert.image, cert.title[locale])}
                    >
                      <img src={cert.image} alt={cert.title[locale]} />
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{cert.title[locale]}</h3>
                      <span className={styles.cardIssuer}>{cert.issuer}</span>
                      <div className={styles.cardFooter}>
                        <time className={styles.cardDate}>{cert.date}</time>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.cardLink}
                          >
                            {dict.certificates.viewCredential} →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {lightbox && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Close">
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
