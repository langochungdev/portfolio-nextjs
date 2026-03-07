"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Certificate } from "@/lib/mock/certificates";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/certificates/page.module.css";

interface AutoScrollColumnProps {
  certs: Certificate[];
  locale: Locale;
  viewCredentialLabel: string;
  onImageClick: (src: string, alt: string) => void;
}

const SCROLL_SPEED = 0.5;

export function AutoScrollColumn({
  certs,
  locale,
  viewCredentialLabel,
  onImageClick,
}: AutoScrollColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const userScrollTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [needsScroll, setNeedsScroll] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setNeedsScroll(el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow]);

  useEffect(() => {
    if (!needsScroll) return;
    const el = scrollRef.current;
    if (!el) return;

    const animate = () => {
      if (!pausedRef.current && el) {
        el.scrollTop += SCROLL_SPEED;
        const halfScroll = el.scrollHeight / 2;
        if (el.scrollTop >= halfScroll) {
          el.scrollTop -= halfScroll;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [needsScroll]);

  function handleMouseEnter() {
    pausedRef.current = true;
  }

  function handleMouseLeave() {
    pausedRef.current = false;
  }

  function handleWheel() {
    pausedRef.current = true;
    clearTimeout(userScrollTimeout.current);
    userScrollTimeout.current = setTimeout(() => {
      pausedRef.current = false;
    }, 2000);
  }

  const items = needsScroll ? [...certs, ...certs] : certs;

  return (
    <div
      ref={scrollRef}
      className={styles.columnScroll}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={handleWheel}
    >
      {items.map((cert, i) => (
        <div key={`${cert.id}-${i}`} className={styles.card}>
          <div
            className={styles.imageWrapper}
            onClick={() => onImageClick(cert.image, cert.title[locale])}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cert.image}
              alt={cert.title[locale]}
              className={styles.cardImage}
            />
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{cert.title[locale]}</h3>
            <span className={styles.cardIssuer}>{cert.issuer}</span>
            <time className={styles.cardDate}>{cert.date}</time>
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.credLink}
              >
                {viewCredentialLabel} →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
