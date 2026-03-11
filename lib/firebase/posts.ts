import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface PostInput {
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  collectionId: string;
  topicId: string;
  isPinned: boolean;
}

export async function createPost(data: PostInput) {
  const ref = await addDoc(collection(db, "posts"), {
    ...data,
    views: 0,
    timestamps: {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  });
  return ref.id;
}

export async function updatePost(id: string, data: Partial<PostInput>) {
  await updateDoc(doc(db, "posts", id), {
    ...data,
    "timestamps.updatedAt": serverTimestamp(),
  });
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, "posts", id));
}
