import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function saveFcmToken(
  visitorId: string,
  token: string,
): Promise<void> {
  await setDoc(
    doc(db, "conversations", visitorId),
    { fcmToken: token },
    { merge: true },
  );
}

export interface FcmSubscriber {
  visitorId: string;
  userName: string;
  fcmToken: string;
}

export async function fetchFcmSubscribers(): Promise<FcmSubscriber[]> {
  const snap = await getDocs(collection(db, "conversations"));
  const subscribers: FcmSubscriber[] = [];
  for (const d of snap.docs) {
    const data = d.data();
    if (data.fcmToken) {
      subscribers.push({
        visitorId: d.id,
        userName: data.userName || d.id.slice(0, 8),
        fcmToken: data.fcmToken,
      });
    }
  }
  return subscribers;
}
