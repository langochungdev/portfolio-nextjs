"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/shared/EyesCat.module.css";

interface PupilOffset {
  x: number;
  y: number;
}

const MAX_PUPIL = 4;

function calcPupilOffset(
  eyeCenterX: number,
  eyeCenterY: number,
  mouseX: number,
  mouseY: number
): PupilOffset {
  const dx = mouseX - eyeCenterX;
  const dy = mouseY - eyeCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: 0, y: 0 };
  const clamp = Math.min(dist / 60, 1);
  return {
    x: (dx / dist) * MAX_PUPIL * clamp,
    y: (dy / dist) * MAX_PUPIL * clamp,
  };
}

export function EyesCat() {
  const { dictionary: dict } = useDictionary();
  const catRef = useRef<HTMLDivElement>(null);
  const [leftPupil, setLeftPupil] = useState<PupilOffset>({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState<PupilOffset>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!catRef.current) return;
    const rect = catRef.current.getBoundingClientRect();
    const scale = rect.width / 72;
    setLeftPupil(
      calcPupilOffset(
        rect.left + 28 * scale,
        rect.top + 27 * scale,
        e.clientX,
        e.clientY
      )
    );
    setRightPupil(
      calcPupilOffset(
        rect.left + 50 * scale,
        rect.top + 27 * scale,
        e.clientX,
        e.clientY
      )
    );
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setSent(false);
    }, 2000);
  }

  return (
    <>
      <div
        ref={catRef}
        className={styles.cat}
        onClick={() => setOpen(true)}
        title={dict.eyesCat.title}
        role="button"
        aria-label={dict.eyesCat.title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/cat-icon.png"
          alt="cat"
          className={styles.catImage}
          draggable={false}
        />
        <div className={styles.eyesOverlay}>
          <div className={styles.eye + " " + styles.leftEye}>
            <div
              className={styles.pupil}
              style={{ transform: `translate(${leftPupil.x}px, ${leftPupil.y}px)` }}
            />
          </div>
          <div className={styles.eye + " " + styles.rightEye}>
            <div
              className={styles.pupil}
              style={{ transform: `translate(${rightPupil.x}px, ${rightPupil.y}px)` }}
            />
          </div>
        </div>
      </div>

      {open &&
        createPortal(
          <div className={styles.overlay}>
            <div className={styles.backdrop} onClick={() => setOpen(false)} />
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/cat-icon.png"
                  alt="cat"
                  className={styles.formCatThumb}
                  draggable={false}
                />
                <span className={styles.formTitle}>{dict.eyesCat.formTitle}</span>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {sent ? (
                <p className={styles.successMsg}>{dict.eyesCat.successMsg}</p>
              ) : (
                <>
                  <textarea
                    className={styles.textarea}
                    placeholder={dict.eyesCat.placeholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={500}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={!message.trim()}
                  >
                    {dict.eyesCat.send}
                  </button>
                </>
              )}
            </form>
          </div>,
          document.body
        )}
    </>
  );
}
