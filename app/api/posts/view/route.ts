import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

interface TrackPostViewPayload {
  postId: string;
  visitorId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { postId, visitorId } = (await req.json()) as TrackPostViewPayload;

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const postRef = db.collection("posts").doc(postId);
    const summaryRef = db.collection("post_summaries").doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await Promise.all([
      postRef.set({ views: FieldValue.increment(1) }, { merge: true }),
      summaryRef.set(
        { postId, views: FieldValue.increment(1) },
        { merge: true },
      ),
    ]);

    if (visitorId && typeof visitorId === "string") {
      const conversationRef = db.collection("conversations").doc(visitorId);
      await conversationRef.set(
        {
          viewedPostIds: FieldValue.arrayUnion(postId),
        },
        { merge: true },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Track post view error:", err);
    return NextResponse.json(
      { error: "Failed to track post view" },
      { status: 500 },
    );
  }
}
