"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { PageViewTracker } from "@/app/[lang]/_shared/PageViewTracker";
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

function CertMarquee({
  certs,
  locale,
  onOpen,
}: {
  certs: Certificate[];
  locale: "vi" | "en";
  onOpen: (src: string, alt: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const check = () => setShouldScroll(el.scrollWidth > el.parentElement!.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, [certs]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const row = rowRef.current;
    if (!row) return;
    dragging.current = true;
    didDrag.current = false;
    startX.current = e.clientX;
    scrollLeft.current = row.scrollLeft;
    row.classList.add(styles.certRowDragging);
    row.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !rowRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) didDrag.current = true;
    rowRef.current.scrollLeft = scrollLeft.current - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    rowRef.current?.classList.remove(styles.certRowDragging);
  }, []);

  const renderCard = (cert: Certificate, keyPrefix = "") => (
    <div
      key={`${keyPrefix}${cert.id}`}
      className={styles.card}
      onClick={() => { if (!didDrag.current) onOpen(cert.image, cert.title[locale]); }}
    >
      <div className={styles.cardImage}>
        <img src={cert.image} alt={cert.title[locale]} />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{cert.title[locale]}</h3>
        <span className={styles.cardDate}>{cert.date}</span>
      </div>
    </div>
  );

  return (
    <div
      ref={rowRef}
      className={`${styles.certRow} ${shouldScroll ? styles.certRowScroll : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div ref={trackRef} className={styles.marqueeTrack}>
        {certs.map((c) => renderCard(c))}
      </div>
      {shouldScroll && (
        <div className={styles.marqueeTrack} aria-hidden>
          {certs.map((c) => renderCard(c, "dup-"))}
        </div>
      )}
    </div>
  );
}

function CertGrid({
  certs,
  locale,
  onOpen,
}: {
  certs: Certificate[];
  locale: "vi" | "en";
  onOpen: (src: string, alt: string) => void;
}) {
  return (
    <div className={styles.certGrid}>
      {certs.map((cert) => (
        <div
          key={cert.id}
          className={styles.card}
          onClick={() => onOpen(cert.image, cert.title[locale])}
        >
          <div className={styles.cardImage}>
            <img src={cert.image} alt={cert.title[locale]} />
          </div>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>{cert.title[locale]}</h3>
            <span className={styles.cardDate}>{cert.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
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
      <PageViewTracker page="certification" />
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
            >
              <div className={styles.collectorHeader}>
                <span className={styles.collectorDot} style={{ background: color }} />
                <h2 className={styles.collectorTitle}>{catLabel}</h2>
                <span className={styles.collectorMeta}>
                  {certs.length} certs
                </span>
              </div>

              {activeCategory === "all" ? (
                <CertMarquee certs={certs} locale={locale} onOpen={openLightbox} />
              ) : (
                <CertGrid certs={certs} locale={locale} onOpen={openLightbox} />
              )}
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
