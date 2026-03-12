"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { useTheme } from "@/app/[lang]/_shared/useTheme";
import { useVisitor } from "@/lib/visitor/VisitorProvider";
import {
  sendMessage,
  subscribeMessages,
  fetchConversationUserName,
  updateConversationUserName,
  type MessageDoc,
} from "@/lib/firebase/conversations";
import { i18nConfig } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/shared/EyesCat.module.css";

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

interface PupilOffset {
  x: number;
  y: number;
}

const MAX_PUPIL = 4;

function useVirtualKeyboard(overlayRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    const el = overlayRef.current;
    if (!active || !el || !window.visualViewport) return;

    const vv = window.visualViewport;
    let raf = 0;

    function sync() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        const kbOpen = window.innerHeight - vv!.height > 50;
        if (kbOpen) {
          el.style.height = `${vv!.height}px`;
          el.style.top = `${vv!.offsetTop}px`;
        } else {
          el.style.height = "";
          el.style.top = "";
        }
      });
    }

    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      if (el) {
        el.style.height = "";
        el.style.top = "";
      }
    };
  }, [overlayRef, active]);
}

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

interface EyeMove {
  left: PupilOffset;
  right: PupilOffset;
  ms: number;
  hold: number;
  ease: "out" | "inout";
}

const P = MAX_PUPIL;
const CENTER: PupilOffset = { x: 0, y: 0 };

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randDir(): PupilOffset {
  const a = Math.random() * Math.PI * 2;
  const r = rnd(0.5, 1) * P;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

function* catBehavior(): Generator<EyeMove> {
  while (true) {
    const roll = Math.random();

    if (roll < 0.25) {
      const t = randDir();
      yield { left: t, right: t, ms: 100, hold: rnd(600, 1400), ease: "out" };
      yield { left: CENTER, right: CENTER, ms: 350, hold: rnd(200, 500), ease: "out" };
    } else if (roll < 0.5) {
      const yJitter = rnd(-0.5, 0.5);
      const L: PupilOffset = { x: -P * 0.85, y: yJitter };
      const R: PupilOffset = { x: P * 0.85, y: yJitter };
      yield { left: L, right: L, ms: 700, hold: 200, ease: "inout" };
      yield { left: R, right: R, ms: 1100, hold: 200, ease: "inout" };
      yield { left: CENTER, right: CENTER, ms: 500, hold: rnd(400, 700), ease: "inout" };
    } else if (roll < 0.7) {
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const pt: PupilOffset = { x: Math.cos(a) * P * 0.7, y: Math.sin(a) * P * 0.5 };
        yield { left: pt, right: pt, ms: 220, hold: 0, ease: "inout" };
      }
      yield { left: CENTER, right: CENTER, ms: 300, hold: rnd(600, 1000), ease: "out" };
    } else if (roll < 0.85) {
      const down: PupilOffset = { x: 0, y: P * 0.6 };
      const up: PupilOffset = { x: 0, y: -P * 0.3 };
      yield { left: down, right: down, ms: 1400, hold: rnd(800, 1200), ease: "inout" };
      yield { left: up, right: up, ms: 100, hold: 250, ease: "out" };
      yield { left: CENTER, right: CENTER, ms: 400, hold: rnd(300, 600), ease: "out" };
    } else {
      const divergeL: PupilOffset = { x: -1.5, y: rnd(-1, 0) };
      const divergeR: PupilOffset = { x: 1.5, y: rnd(-1, 0) };
      yield { left: divergeL, right: divergeR, ms: 280, hold: rnd(600, 900), ease: "out" };
      const snap = randDir();
      yield { left: snap, right: snap, ms: 120, hold: rnd(500, 800), ease: "out" };
      yield { left: CENTER, right: CENTER, ms: 400, hold: rnd(300, 500), ease: "out" };
    }

    yield { left: CENTER, right: CENTER, ms: 100, hold: rnd(200, 600), ease: "out" };
  }
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function EyesCat() {
  const { dictionary: dict, locale } = useDictionary();
  const { theme, toggle: toggleTheme } = useTheme();
  const pathname = usePathname();
  const catRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [leftPupil, setLeftPupil] = useState<PupilOffset>({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState<PupilOffset>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const { visitorId, loading: visitorLoading } = useVisitor();
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const prevMsgCountRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useVirtualKeyboard(overlayRef, open);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (name.trim()) textareaRef.current?.focus();
      else nameRef.current?.focus();
    });
  }, [open]);

  useEffect(() => {
    const hour = new Date().getHours();
    let msg: string;
    const trimmedName = name.trim();
    if (hour >= 5 && hour < 12)
      msg = trimmedName ? dict.eyesCat.greetMorningName.replace("{name}", trimmedName) : dict.eyesCat.greetMorning;
    else if (hour >= 12 && hour < 18)
      msg = trimmedName ? dict.eyesCat.greetAfternoonName.replace("{name}", trimmedName) : dict.eyesCat.greetAfternoon;
    else
      msg = trimmedName ? dict.eyesCat.greetEveningName.replace("{name}", trimmedName) : dict.eyesCat.greetEvening;

    const showTimer = setTimeout(() => setGreeting(msg), 1500);
    const hideTimer = setTimeout(() => setGreeting(null), 6000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [name, dict.eyesCat.greetMorning, dict.eyesCat.greetAfternoon, dict.eyesCat.greetEvening, dict.eyesCat.greetMorningName, dict.eyesCat.greetAfternoonName, dict.eyesCat.greetEveningName]);

  useEffect(() => {
    if (messages.length === 0) return;
    const prev = prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (prev === 0) return;
    if (messages.length <= prev) return;
    const latest = messages[messages.length - 1];
    if (latest.sender !== "admin" || open) return;
    setGreeting(latest.text);
    const timer = setTimeout(() => setGreeting(null), 8000);
    return () => clearTimeout(timer);
  }, [messages.length, open]);

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
    const isMobile = window.matchMedia("(hover: none)").matches;
    if (isMobile) return;
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  useEffect(() => {
    const isMobile = window.matchMedia("(hover: none)").matches;
    if (!isMobile) return;

    let raf: number;
    const gen = catBehavior();
    let curL: PupilOffset = { x: 0, y: 0 };
    let curR: PupilOffset = { x: 0, y: 0 };
    let startL: PupilOffset = { ...curL };
    let startR: PupilOffset = { ...curR };
    let move = gen.next().value!;
    let moveStart = performance.now();
    let phase: "move" | "hold" = "move";
    let holdStart = 0;

    function apply(t: number) {
      const e = move.ease === "out" ? easeOut(t) : easeInOut(t);
      curL = { x: startL.x + (move.left.x - startL.x) * e, y: startL.y + (move.left.y - startL.y) * e };
      curR = { x: startR.x + (move.right.x - startR.x) * e, y: startR.y + (move.right.y - startR.y) * e };
      setLeftPupil({ ...curL });
      setRightPupil({ ...curR });
    }

    function nextMove(now: number) {
      const next = gen.next();
      if (next.done) return;
      move = next.value;
      startL = { ...curL };
      startR = { ...curR };
      moveStart = now;
      phase = "move";
    }

    function tick(now: number) {
      if (phase === "move") {
        const raw = move.ms > 0 ? Math.min((now - moveStart) / move.ms, 1) : 1;
        apply(raw);
        if (raw >= 1) {
          phase = "hold";
          holdStart = now;
        }
      } else if (now - holdStart >= move.hold) {
        nextMove(now);
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    fetchConversationUserName(visitorId)
      .then((saved) => { if (saved) setName(saved); })
      .catch(() => {});
  }, [visitorId]);

  useEffect(() => {
    if (!visitorId) return;
    return subscribeMessages(visitorId, setMessages);
  }, [visitorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    const text = message.trim();
    if (!text || !visitorId || sending) return;
    setSending(true);
    try {
      await sendMessage(visitorId, text, "user");
      setMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div
        ref={catRef}
        className={styles.cat}
        onClick={() => { setOpen(true); setGreeting(null); }}
        title={dict.eyesCat.title}
        role="button"
        aria-label={dict.eyesCat.title}
      >
        {greeting && (
          <div className={styles.speechBalloon}>
            {greeting}
          </div>
        )}
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
          <div
            ref={overlayRef}
            className={styles.overlay}
          >
            <div className={styles.backdrop} onClick={() => setOpen(false)} />
            <div className={styles.chatPanel}>
              <div className={styles.chatHeader}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/cat-icon.png"
                  alt="cat"
                  className={styles.formCatThumb}
                  draggable={false}
                />
                <div className={styles.chatHeaderInfo}>
                  <input
                    ref={nameRef}
                    className={styles.headerNameInput}
                    placeholder={dict.eyesCat.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = name.trim();
                        if (trimmed && visitorId) {
                          updateConversationUserName(visitorId, trimmed).catch(() => {});
                        }
                        textareaRef.current?.focus();
                      }
                    }}
                    onBlur={() => {
                      const trimmed = name.trim();
                      if (trimmed && visitorId) {
                        updateConversationUserName(visitorId, trimmed).catch(() => {});
                      }
                    }}
                  />
                  <span className={styles.chatStatus}>Online</span>
                </div>
                <div className={styles.settingsRow}>
                  <button
                    type="button"
                    className={styles.settingBtn}
                    onClick={toggleTheme}
                    aria-label={theme === "light" ? "Dark mode" : "Light mode"}
                  >
                    {theme === "light" ? SunIcon : MoonIcon}
                  </button>
                  <Link
                    href={(() => {
                      const nextLocale = i18nConfig.locales.find((l) => l !== locale) ?? i18nConfig.defaultLocale;
                      const segments = pathname.split("/");
                      segments[1] = nextLocale;
                      return segments.join("/");
                    })()}
                    className={styles.settingBtn}
                  >
                    {(i18nConfig.locales.find((l) => l !== locale) ?? i18nConfig.defaultLocale).toUpperCase()}
                  </Link>
                </div>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className={styles.chatBody}>
                <div className={styles.msgRow}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/cat-icon.png" alt="cat" className={styles.msgAvatar} draggable={false} />
                  <div className={styles.msgBubbleReceived}>
                    {dict.eyesCat.formTitle}
                  </div>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.msgRow} ${msg.sender === "user" ? styles.msgRowSent : ""}`}
                  >
                    {msg.sender === "admin" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/img/cat-icon.png" alt="cat" className={styles.msgAvatar} draggable={false} />
                    )}
                    <div className={msg.sender === "user" ? styles.msgBubbleSent : styles.msgBubbleReceived}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              <form className={styles.chatInputBar} onSubmit={handleSubmit}>
                <div className={styles.chatInputRow}>
                  <textarea
                    ref={textareaRef}
                    className={styles.chatTextarea}
                    placeholder={dict.eyesCat.placeholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={1}
                    maxLength={500}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (name.trim() && message.trim()) handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className={styles.sendBtn}
                    disabled={!message.trim() || sending}
                    aria-label={dict.eyesCat.send}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22 11 13 2 9z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
