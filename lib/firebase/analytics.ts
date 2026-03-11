import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export type PageKey = "home" | "blog" | "certification";

const TRACKED_KEY = "tracked_pages";
const SESSION_TTL = 30 * 60 * 1000;

function getSessionTracker(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(TRACKED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function markTracked(page: PageKey): void {
  try {
    const tracker = getSessionTracker();
    tracker[page] = Date.now();
    sessionStorage.setItem(TRACKED_KEY, JSON.stringify(tracker));
  } catch {
    /* sessionStorage may be blocked */
  }
}

function wasRecentlyTracked(page: PageKey): boolean {
  const tracker = getSessionTracker();
  const ts = tracker[page];
  if (!ts) return false;
  return Date.now() - ts < SESSION_TTL;
}

function getTodayId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function trackPageView(page: PageKey): void {
  if (wasRecentlyTracked(page)) return;

  markTracked(page);

  const globalRef = doc(db, "analytics", "global");
  const dayId = getTodayId();
  const dailyRef = doc(db, "analytics", "daily_stats", "days", dayId);

  Promise.all([
    setDoc(globalRef, { [page]: increment(1) }, { merge: true }),
    setDoc(
      dailyRef,
      { date: getTodayDateStr(), [page]: increment(1) },
      { merge: true },
    ),
  ]).catch(() => {});
}
