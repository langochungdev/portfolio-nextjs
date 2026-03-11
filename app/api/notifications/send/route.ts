import { NextRequest, NextResponse } from "next/server";
import { getAdminMessaging } from "@/lib/firebase/admin";

interface SendPayload {
  title: string;
  body: string;
  tokens: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, tokens } = (await req.json()) as SendPayload;

    if (!title || !body || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json(
        { error: "title, body, and tokens[] are required" },
        { status: 400 },
      );
    }

    const messaging = getAdminMessaging();
    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
    });

    return NextResponse.json({
      success: result.successCount,
      failure: result.failureCount,
    });
  } catch (err) {
    console.error("FCM send error:", err);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
