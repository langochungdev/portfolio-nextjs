export async function generateFingerprint(): Promise<string> {
  const signals: string[] = [];

  signals.push(getNavigatorSignals());
  signals.push(getScreenSignals());
  signals.push(getTimezoneSignals());
  signals.push(await getWebGLFingerprint());
  signals.push(getFontSignals());
  signals.push(getHardwareSignals());

  const raw = signals.filter(Boolean).join("|");
  return sha256(raw);
}

function getNavigatorSignals(): string {
  const n = navigator;
  return [
    n.userAgent,
    n.language,
    (n.languages || []).join(","),
    n.platform,
    n.hardwareConcurrency || 0,
    (n as Navigator & { deviceMemory?: number }).deviceMemory || "unknown",
    n.maxTouchPoints || 0,
    "pdfViewerEnabled" in n ? String(n.pdfViewerEnabled) : "n/a",
  ].join("::");
}

function getScreenSignals(): string {
  const s = screen;
  return [
    s.width,
    s.height,
    s.colorDepth,
    s.pixelDepth,
    devicePixelRatio || 1,
  ].join("::");
}

function getTimezoneSignals(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  return `${tz}::${offset}`;
}

async function getWebGLFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return "no-webgl";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : "unknown";
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : "unknown";

    const extensions = (gl.getSupportedExtensions() || []).join(",");
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);

    return [vendor, renderer, maxTextureSize, maxViewport, extensions].join(
      "::",
    );
  } catch {
    return "webgl-error";
  }
}

function getFontSignals(): string {
  const testFonts = [
    "monospace",
    "sans-serif",
    "serif",
    "Arial",
    "Courier New",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Helvetica",
    "Comic Sans MS",
    "Impact",
    "Lucida Console",
    "Palatino Linotype",
    "Trebuchet MS",
    "Tahoma",
  ];

  const baseFonts = ["monospace", "sans-serif", "serif"];
  const testStr = "mmmmmmmmmmlli";
  const testSize = "72px";

  try {
    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.left = "-9999px";
    span.style.fontSize = testSize;
    span.style.lineHeight = "normal";
    span.textContent = testStr;
    document.body.appendChild(span);

    const baseWidths: Record<string, number> = {};
    for (const bf of baseFonts) {
      span.style.fontFamily = bf;
      baseWidths[bf] = span.offsetWidth;
    }

    const detected: string[] = [];
    for (const font of testFonts) {
      for (const bf of baseFonts) {
        span.style.fontFamily = `'${font}', ${bf}`;
        if (span.offsetWidth !== baseWidths[bf]) {
          detected.push(font);
          break;
        }
      }
    }

    document.body.removeChild(span);
    return `fonts::${detected.join(",")}`;
  } catch {
    return "fonts-error";
  }
}

function getHardwareSignals(): string {
  const signals: string[] = [];

  signals.push(String("ontouchstart" in window));
  signals.push(
    String(
      "mediaDevices" in navigator &&
        "enumerateDevices" in navigator.mediaDevices,
    ),
  );
  signals.push(String("bluetooth" in navigator));
  signals.push(String("usb" in navigator));

  return `hw::${signals.join(",")}`;
}

async function sha256(message: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const chr = message.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
