import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { publicIds } = (await req.json()) as { publicIds: string[] };
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: "No publicIds provided" },
        { status: 400 },
      );
    }

    const results = await Promise.allSettled(
      publicIds.map(async (publicId) => {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
        const signature = crypto
          .createHash("sha1")
          .update(paramsToSign + API_SECRET)
          .digest("hex");

        const form = new URLSearchParams();
        form.append("public_id", publicId);
        form.append("timestamp", timestamp);
        form.append("api_key", API_KEY);
        form.append("signature", signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
          { method: "POST", body: form },
        );
        return { publicId, ok: res.ok };
      }),
    );

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 },
    );
  }
}
