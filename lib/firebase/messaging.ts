import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { getApps } from "firebase/app";

let messagingInstance: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (messagingInstance) return messagingInstance;

  const app = getApps()[0];
  if (!app) return null;

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

async function registerFcmServiceWorker(): Promise<
  ServiceWorkerRegistration | undefined
> {
  const existing = await navigator.serviceWorker.getRegistration(
    "/firebase-messaging-sw.js",
  );
  if (existing) return existing;

  const reg = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  await navigator.serviceWorker.ready;

  reg.active?.postMessage({
    type: "FIREBASE_CONFIG",
    config: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
  });

  return reg;
}

export async function requestFcmToken(): Promise<string | null> {
  if (!("Notification" in window) || !("serviceWorker" in navigator))
    return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = getMessagingInstance();
  if (!messaging) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  const swReg = await registerFcmServiceWorker();

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: swReg,
  });

  return token || null;
}

export function onForegroundMessage(
  callback: (payload: { title: string; body: string }) => void,
): (() => void) | null {
  const messaging = getMessagingInstance();
  if (!messaging) return null;

  const unsubscribe = onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "Thông báo";
    const body = payload.notification?.body ?? "";
    callback({ title, body });
  });

  return unsubscribe;
}
