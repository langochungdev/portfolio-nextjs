"use client";

import { useState, useCallback, useMemo } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { CollectionSidebar } from "@/app/[lang]/_shared/CollectionSidebar";
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

  const collectionItems = certCategories.map((cat) => ({
    key: cat,
    label: dict.certificates.categories[cat as keyof typeof dict.certificates.categories],
    color: certCollectionColors[cat] ?? "#1C1C1A",
    count: grouped[cat]?.length ?? 0,
  }));

  return (
    <div className={styles.shell}>
      <CollectionSidebar
        locale={locale}
        activeKey={activeCategory}
        onSelect={setActiveCategory}
        allKey="all"
        allLabel={dict.certificates.title}
        allCount={certificates.length}
        items={collectionItems}
      />

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
