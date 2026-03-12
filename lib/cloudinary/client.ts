import { resizeImage, dataUrlToBlob } from "@/lib/cloudinary/resize";

type ResourceType = "image" | "video" | "raw";

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

export interface MediaUploadResult {
  url: string;
  publicId: string;
  resourceType: ResourceType;
}

export async function uploadMediaToCloudinary(
  blob: Blob,
  filename: string,
  resourceType?: ResourceType,
): Promise<MediaUploadResult> {
  const form = new FormData();
  form.append("file", blob, filename);
  if (resourceType) form.append("resource_type", resourceType);

  const res = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Upload failed");
  }

  return await res.json();
}

export async function deleteFromCloudinary(
  publicIds: string[],
  resourceType: ResourceType = "image",
): Promise<void> {
  if (publicIds.length === 0) return;

  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicIds, resourceType }),
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

export function extractMediaSrcs(html: string): { src: string; tag: string }[] {
  const results: { src: string; tag: string }[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  const videoRegex = /<video[^>]+src="([^"]+)"/g;
  const audioRegex = /<audio[^>]+src="([^"]+)"/g;
  const sourceRegex = /<source[^>]+src="([^"]+)"/g;
  const anchorDataFileRegex = /<a[^>]+data-file-src="([^"]+)"/g;
  const filePreviewRegex =
    /<div\s+class="file-preview">\s*<iframe[^>]+src="([^"]+)"/g;

  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null)
    results.push({ src: m[1], tag: "img" });
  while ((m = videoRegex.exec(html)) !== null)
    results.push({ src: m[1], tag: "video" });
  while ((m = audioRegex.exec(html)) !== null)
    results.push({ src: m[1], tag: "audio" });
  while ((m = sourceRegex.exec(html)) !== null)
    results.push({ src: m[1], tag: "source" });
  while ((m = anchorDataFileRegex.exec(html)) !== null)
    results.push({ src: m[1], tag: "file" });
  while ((m = filePreviewRegex.exec(html)) !== null)
    results.push({ src: m[1], tag: "file" });

  return results;
}

function detectResourceType(url: string): ResourceType {
  const match = url.match(
    /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//,
  );
  if (match) return match[1] as ResourceType;
  return "image";
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
  const newMedia = extractMediaSrcs(newHtml);
  const oldMedia = extractMediaSrcs(oldHtml);
  const newSrcs = newMedia.map((m) => m.src);

  const oldCloudinaryMap = new Map<string, string>();
  for (const m of oldMedia) {
    if (isCloudinaryUrl(m.src)) oldCloudinaryMap.set(m.src, m.tag);
  }
  const newCloudinaryUrls = new Set(newSrcs.filter(isCloudinaryUrl));

  const removedByType = new Map<ResourceType, string[]>();
  for (const [url] of oldCloudinaryMap) {
    if (!newCloudinaryUrls.has(url)) {
      const id = extractPublicId(url);
      if (id) {
        const rt = detectResourceType(url);
        if (!removedByType.has(rt)) removedByType.set(rt, []);
        removedByType.get(rt)!.push(id);
      }
    }
  }

  const deletePromises = [...removedByType.entries()].map(([rt, ids]) =>
    deleteFromCloudinary(ids, rt),
  );
  if (deletePromises.length > 0) await Promise.all(deletePromises);

  const localEntries = newMedia.filter((m) => isLocalMedia(m.src));
  if (localEntries.length === 0) {
    return { processedHtml: newHtml, uploadedIds: [] };
  }

  const imgEntries = localEntries.filter((m) => m.tag === "img");
  const mediaEntries = localEntries.filter((m) => m.tag !== "img");

  const imgBlobs = await Promise.all(
    imgEntries.map(async ({ src }) => {
      if (isDataUrl(src)) return { src, blob: dataUrlToBlob(src) };
      const res = await fetch(src);
      return { src, blob: await res.blob() };
    }),
  );

  const imgResults = await Promise.all(
    imgBlobs.map(({ blob }) => uploadToCloudinary(blob)),
  );

  const mediaBlobs = await Promise.all(
    mediaEntries.map(async ({ src }) => {
      if (isDataUrl(src)) return { src, blob: dataUrlToBlob(src) };
      const res = await fetch(src);
      return { src, blob: await res.blob() };
    }),
  );

  const mediaResults = await Promise.all(
    mediaBlobs.map(({ src, blob }) => {
      const ext = src.split(".").pop()?.split("?")[0] ?? "bin";
      return uploadMediaToCloudinary(blob, `media.${ext}`);
    }),
  );

  let html = newHtml;
  const uploadedIds: string[] = [];

  for (let i = 0; i < imgEntries.length; i++) {
    const { url, publicId, width, height } = imgResults[i];
    html = html.replaceAll(
      `src="${imgEntries[i].src}"`,
      `src="${url}" data-natural-width="${width}" data-natural-height="${height}"`,
    );
    uploadedIds.push(publicId);
  }

  for (let i = 0; i < mediaEntries.length; i++) {
    const { url, publicId } = mediaResults[i];
    html = html.replaceAll(mediaEntries[i].src, url);
    uploadedIds.push(publicId);
  }

  return { processedHtml: html, uploadedIds };
}

export async function deleteContentMedia(html: string): Promise<void> {
  const media = extractMediaSrcs(html);
  const byType = new Map<ResourceType, string[]>();

  for (const m of media) {
    if (isCloudinaryUrl(m.src)) {
      const id = extractPublicId(m.src);
      if (id) {
        const rt = detectResourceType(m.src);
        if (!byType.has(rt)) byType.set(rt, []);
        byType.get(rt)!.push(id);
      }
    }
  }

  const promises = [...byType.entries()].map(([rt, ids]) =>
    deleteFromCloudinary(ids, rt),
  );
  if (promises.length > 0) await Promise.all(promises);
}
