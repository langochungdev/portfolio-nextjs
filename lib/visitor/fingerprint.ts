import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint: string | null = null;

export async function generateFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
  } catch {
    return "fp-error";
  }
}
