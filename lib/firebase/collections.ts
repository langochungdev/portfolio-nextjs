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
import { db } from "@/lib/firebase/config";

export interface CollectionDoc {
  id: string;
  name: string;
  order: number;
}

export interface TopicDoc {
  id: string;
  name: string;
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
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TopicDoc, "id">),
  }));
}

export async function addTopic(
  name: string,
  collectionId: string,
  order: number,
): Promise<string> {
  const ref = await addDoc(collection(db, "topics"), {
    name,
    collectionId,
    order,
  });
  return ref.id;
}

export async function renameTopic(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, "topics", id), { name });
}

export async function deleteTopic(id: string): Promise<void> {
  await deleteDoc(doc(db, "topics", id));
}
