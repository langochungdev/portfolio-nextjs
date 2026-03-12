import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

type ResourceType = "image" | "video" | "raw";

function getResourceType(mime: string): ResourceType {
  if (mime.startsWith("video/") || mime.startsWith("audio/")) return "video";
  if (mime.startsWith("image/")) return "image";
  return "raw";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const resourceType: ResourceType =
      (formData.get("resource_type") as ResourceType) ||
      getResourceType(file.type);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "portfolio/posts";

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + API_SECRET)
      .digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("folder", folder);
    uploadForm.append("api_key", API_KEY);
    uploadForm.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: uploadForm },
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Cloudinary upload failed", details: text },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json({
      url: data.secure_url as string,
      publicId: data.public_id as string,
      resourceType,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
