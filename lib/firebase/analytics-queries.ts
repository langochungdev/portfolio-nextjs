import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";

const db = getFirebaseDb();

export interface GlobalStats {
  home: number;
  blog: number;
  certification: number;
}

export interface DailyStats {
  date: string;
  home: number;
  blog: number;
  certification: number;
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const ref = doc(db, "analytics", "global");
  const snap = await getDoc(ref);
  if (!snap.exists()) return { home: 0, blog: 0, certification: 0 };
  const data = snap.data();
  return {
    home: data.home ?? 0,
    blog: data.blog ?? 0,
    certification: data.certification ?? 0,
  };
}

function formatDayId(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[1]}/${parts[2]}`;
}

export async function fetchLast7Days(): Promise<DailyStats[]> {
  const now = new Date();
  const days: string[] = [];
  const dayIds: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(formatDateStr(d));
    dayIds.push(formatDayId(d));
  }

  const daysCol = collection(db, "analytics", "daily_stats", "days");
  const q = query(
    daysCol,
    where("__name__", "in", dayIds),
    orderBy("__name__"),
  );
  const snap = await getDocs(q);

  const dataMap = new Map<string, DailyStats>();
  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const dateStr = d.date ?? "";
    dataMap.set(docSnap.id, {
      date: formatShortDate(dateStr),
      home: d.home ?? 0,
      blog: d.blog ?? 0,
      certification: d.certification ?? 0,
    });
  }

  return days.map((dateStr, idx) => {
    const entry = dataMap.get(dayIds[idx]);
    return (
      entry ?? {
        date: formatShortDate(dateStr),
        home: 0,
        blog: 0,
        certification: 0,
      }
    );
  });
}

export interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
}

export async function fetchTopViewedPosts(count = 10): Promise<TopPost[]> {
  const q = query(
    collection(db, "posts"),
    orderBy("views", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: (data.title as string) ?? "",
      slug: (data.slug as string) ?? "",
      views: (data.views as number) ?? 0,
    };
  });
}
