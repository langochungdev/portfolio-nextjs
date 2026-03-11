import { join } from "path";
import sharp from "sharp";

const DISCO_COLORS = [
  "#FF3232", "#32FF32", "#3232FF",
  "#FFFF32", "#FF32FF", "#32FFFF",
  "#FFA500", "#FFFFFF",
];

function generateDiscoBallSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - Math.round((size * 4) / 64);
  const tileSize = size / 8;
  const frame = 0;
  const scale = size / 64;

  let tiles = "";
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const x = cx - radius + col * tileSize;
      const y = cy - radius + row * tileSize;
      const dx = x - cx + tileSize / 2;
      const dy = y - cy + tileSize / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius - 2) {
        const colorIndex = (row * 3 + col + frame * 2) % DISCO_COLORS.length;
        const fade = 1 - Math.pow(dist / radius, 1.5);
        const hex = DISCO_COLORS[colorIndex].replace("#", "");
        const r = Math.round(parseInt(hex.substring(0, 2), 16) * fade);
        const g = Math.round(parseInt(hex.substring(2, 4), 16) * fade);
        const b = Math.round(parseInt(hex.substring(4, 6), 16) * fade);
        tiles += `<rect x="${x + 1}" y="${y + 1}" width="${tileSize - 2}" height="${tileSize - 2}" fill="rgb(${r},${g},${b})" rx="${Math.max(1, scale * 0.5)}"/>`;
      }
    }
  }

  const rays = [];
  for (let i = 0; i < 8; i++) {
    const rayAngle = (i * 45 * Math.PI) / 180;
    const rx1 = cx + (radius + 2) * Math.cos(rayAngle);
    const ry1 = cy + (radius + 2) * Math.sin(rayAngle);
    const rx2 = cx + (radius + 8 * scale) * Math.cos(rayAngle);
    const ry2 = cy + (radius + 8 * scale) * Math.sin(rayAngle);
    rays.push(
      `<line x1="${rx1}" y1="${ry1}" x2="${rx2}" y2="${ry2}" stroke="${DISCO_COLORS[i % DISCO_COLORS.length]}" stroke-opacity="0.8" stroke-width="${Math.max(2, 2 * scale)}" stroke-linecap="round"/>`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="circle-${size}">
      <circle cx="${cx}" cy="${cy}" r="${radius}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" fill="#141414" rx="${Math.round(size * 0.15)}"/>
  <g clip-path="url(#circle-${size})">
    <rect width="${size}" height="${size}" fill="#141414"/>
    ${tiles}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${radius - 1}" fill="none" stroke="rgba(220,220,220,0.8)" stroke-width="${Math.max(2, 2 * scale)}"/>
  ${rays.join("\n  ")}
</svg>`;
}

const publicDir = join(process.cwd(), "public");

const icons = [
  { size: 192, filename: "icon-192x192.png" },
  { size: 512, filename: "icon-512x512.png" },
  { size: 180, filename: "apple-touch-icon.png" },
];

for (const { size, filename } of icons) {
  const svg = generateDiscoBallSVG(size);
  const outputPath = join(publicDir, filename);
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated ${filename} (${size}x${size})`);
}

console.log("Done! All PNG icons generated.");
