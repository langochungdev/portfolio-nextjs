import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";

const db = getFirebaseDb();

export interface CollectionDoc {
  id: string;
  name: string;
  order: number;
}

export interface TopicDoc {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  description: string;
  collectionId: string;
  order: number;
}

export async function fetchCollections(): Promise<CollectionDoc[]> {
  const q = query(collection(db, "collections"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CollectionDoc, "id">),
  }));
}

export async function addCollection(
  name: string,
  order: number,
): Promise<string> {
  const ref = await addDoc(collection(db, "collections"), { name, order });
  return ref.id;
}

export async function renameCollection(
  id: string,
  name: string,
): Promise<void> {
  await updateDoc(doc(db, "collections", id), { name });
}

export async function deleteCollection(id: string): Promise<void> {
  await deleteDoc(doc(db, "collections", id));
}

export async function fetchTopics(collectionId?: string): Promise<TopicDoc[]> {
  const col = collection(db, "topics");
  const q = collectionId
    ? query(col, where("collectionId", "==", collectionId), orderBy("order"))
    : query(col, orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "",
      slug: data.slug ?? "",
      thumbnail: data.thumbnail ?? "",
      description: data.description ?? "",
      collectionId: data.collectionId ?? "",
      order: data.order ?? 0,
    };
  });
}

export async function fetchTopicBySlug(slug: string): Promise<TopicDoc | null> {
  const q = query(collection(db, "topics"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    name: data.name ?? "",
    slug: data.slug ?? "",
    thumbnail: data.thumbnail ?? "",
    description: data.description ?? "",
    collectionId: data.collectionId ?? "",
    order: data.order ?? 0,
  };
}

export async function addTopic(
  name: string,
  collectionId: string,
  order: number,
  slug: string = "",
  thumbnail: string = "",
  description: string = "",
): Promise<string> {
  const ref = await addDoc(collection(db, "topics"), {
    name,
    slug,
    thumbnail,
    description,
    collectionId,
    order,
  });
  return ref.id;
}

export async function renameTopic(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, "topics", id), { name });
}

export async function updateTopic(
  id: string,
  data: Partial<Pick<TopicDoc, "name" | "slug" | "thumbnail" | "description">>,
): Promise<void> {
  await updateDoc(doc(db, "topics", id), data);
}

export async function deleteTopic(id: string): Promise<void> {
  await deleteDoc(doc(db, "topics", id));
}
