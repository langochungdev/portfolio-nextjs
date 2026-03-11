import { resizeImage, dataUrlToBlob } from "@/lib/cloudinary/resize";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(blob: Blob): Promise<UploadResult> {
  const { blob: resized, width, height } = await resizeImage(blob);
  const form = new FormData();
  form.append("file", resized, "image.webp");

  const res = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Upload failed");
  }

  const data = await res.json();
  return { ...data, width, height };
}

export async function deleteFromCloudinary(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;

  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicIds }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Delete failed");
  }
}

function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

function isBlobUrl(src: string): boolean {
  return src.startsWith("blob:");
}

function isLocalMedia(src: string): boolean {
  return isDataUrl(src) || isBlobUrl(src);
}

const CLOUDINARY_REGEX = /res\.cloudinary\.com/;

function isCloudinaryUrl(src: string): boolean {
  return CLOUDINARY_REGEX.test(src);
}

export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^./]+$/);
  return match?.[1] ?? null;
}

export function extractImageSrcs(html: string): string[] {
  const srcs: string[] = [];
  const regex = /<img[^>]+src="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    srcs.push(m[1]);
  }
  return srcs;
}

export function extractCloudinaryPublicIds(html: string): string[] {
  return extractImageSrcs(html)
    .filter(isCloudinaryUrl)
    .map(extractPublicId)
    .filter((id): id is string => id !== null);
}

export async function processContentMedia(
  newHtml: string,
  oldHtml: string,
): Promise<{ processedHtml: string; uploadedIds: string[] }> {
  const newSrcs = extractImageSrcs(newHtml);
  const oldSrcs = extractImageSrcs(oldHtml);

  const oldCloudinaryUrls = new Set(oldSrcs.filter(isCloudinaryUrl));
  const newCloudinaryUrls = new Set(newSrcs.filter(isCloudinaryUrl));

  const removedIds = [...oldCloudinaryUrls]
    .filter((url) => !newCloudinaryUrls.has(url))
    .map(extractPublicId)
    .filter((id): id is string => id !== null);

  if (removedIds.length > 0) {
    await deleteFromCloudinary(removedIds);
  }

  const localSrcs = newSrcs.filter(isLocalMedia);
  if (localSrcs.length === 0) {
    return { processedHtml: newHtml, uploadedIds: [] };
  }

  const blobs = await Promise.all(
    localSrcs.map(async (src) => {
      if (isDataUrl(src)) return { src, blob: dataUrlToBlob(src) };
      const res = await fetch(src);
      return { src, blob: await res.blob() };
    }),
  );

  const uploadResults = await Promise.all(
    blobs.map(({ blob }) => uploadToCloudinary(blob)),
  );

  let html = newHtml;
  const uploadedIds: string[] = [];

  for (let i = 0; i < localSrcs.length; i++) {
    const { url, publicId, width, height } = uploadResults[i];
    html = html.replaceAll(
      `src="${localSrcs[i]}"`,
      `src="${url}" data-natural-width="${width}" data-natural-height="${height}"`,
    );
    uploadedIds.push(publicId);
  }

  return { processedHtml: html, uploadedIds };
}

export async function deleteContentMedia(html: string): Promise<void> {
  const ids = extractCloudinaryPublicIds(html);
  if (ids.length > 0) {
    await deleteFromCloudinary(ids);
  }
}
