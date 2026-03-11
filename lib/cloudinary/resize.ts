const TARGET_MAX = 150 * 1024;
const TARGET_MIN = 80 * 1024;

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
}

export async function resizeImage(file: File | Blob): Promise<ResizeResult> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    const bm = await createImageBitmap(file);
    const w = bm.width;
    const h = bm.height;
    bm.close();
    return { blob: file, width: w, height: h };
  }

  if (file.size <= TARGET_MAX) {
    const bm = await createImageBitmap(file);
    const w = bm.width;
    const h = bm.height;
    bm.close();
    return { blob: file, width: w, height: h };
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let quality = 0.82;
  let scale = 1;

  const ratio = Math.sqrt(TARGET_MAX / file.size);
  scale = Math.min(1, ratio * 1.3);

  const canvas = new OffscreenCanvas(
    Math.round(width * scale),
    Math.round(height * scale),
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let result = await canvas.convertToBlob({ type: "image/webp", quality });

  let attempts = 0;
  while (result.size > TARGET_MAX && attempts < 10) {
    quality -= 0.07;
    if (quality < 0.15) {
      scale *= 0.8;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const bm = await createImageBitmap(file);
      ctx.drawImage(bm, 0, 0, canvas.width, canvas.height);
      bm.close();
      quality = 0.55;
    }
    result = await canvas.convertToBlob({ type: "image/webp", quality });
    attempts++;
  }

  if (result.size < TARGET_MIN && quality < 0.8) {
    quality = Math.min(quality + 0.12, 0.88);
    result = await canvas.convertToBlob({ type: "image/webp", quality });
  }

  return { blob: result, width: canvas.width, height: canvas.height };
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
