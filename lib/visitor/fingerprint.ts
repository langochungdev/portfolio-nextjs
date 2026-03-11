export async function generateFingerprint(): Promise<string> {
  const signals: string[] = [];

  signals.push(getNavigatorSignals());
  signals.push(getScreenSignals());
  signals.push(getTimezoneSignals());
  signals.push(getWebGLStableSignals());
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
    n.maxTouchPoints || 0,
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

function getWebGLStableSignals(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return "no-webgl";

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    const aliasedLineRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
    const aliasedPointRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    const maxFragUniformVectors = gl.getParameter(
      gl.MAX_FRAGMENT_UNIFORM_VECTORS,
    );
    const maxVertexUniformVectors = gl.getParameter(
      gl.MAX_VERTEX_UNIFORM_VECTORS,
    );

    return [
      maxTextureSize,
      maxRenderBufferSize,
      Array.from(aliasedLineRange as Float32Array).join(","),
      Array.from(aliasedPointRange as Float32Array).join(","),
      maxVertexAttribs,
      maxVaryingVectors,
      maxFragUniformVectors,
      maxVertexUniformVectors,
    ].join("::");
  } catch {
    return "webgl-error";
  }
}

function getHardwareSignals(): string {
  const signals: string[] = [];

  signals.push(String("ontouchstart" in window));
  signals.push(String(navigator.maxTouchPoints > 0));
  signals.push(String(window.matchMedia("(pointer: coarse)").matches));
  signals.push(String(window.matchMedia("(hover: none)").matches));

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
