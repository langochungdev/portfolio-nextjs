"use client";

import { useEffect } from "react";

const SIZE = 64;
const DISCO_FRAMES = 3;
const DISCO_DURATION = 80;
const LETTER_DURATION = 200;

const LETTERS = [
  { char: "H", color: "#FF50B4" },
  { char: "U", color: "#50C8FF" },
  { char: "N", color: "#FFC832" },
  { char: "G", color: "#50FF96" },
];

const DISCO_COLORS = [
  "#FF3232", "#32FF32", "#3232FF",
  "#FFFF32", "#FF32FF", "#32FFFF",
  "#FFA500", "#FFFFFF",
];

function drawDiscoBall(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE / 2 - 4;
  const angleOffset = frame * (360 / DISCO_FRAMES);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const tileSize = SIZE / 8;
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
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }
  }

  ctx.strokeStyle = "rgba(220,220,220,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
  ctx.stroke();

  const hlAngle = ((angleOffset - 45) * Math.PI) / 180;
  const hx = cx + radius * 0.35 * Math.cos(hlAngle);
  const hy = cy + radius * 0.35 * Math.sin(hlAngle) * 0.6 - radius * 0.1;
  const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, 7);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  for (let i = 0; i < 8; i++) {
    const rayAngle = ((angleOffset * 2.5 + i * 45) * Math.PI) / 180;
    const rx1 = cx + (radius + 2) * Math.cos(rayAngle);
    const ry1 = cy + (radius + 2) * Math.sin(rayAngle);
    const rx2 = cx + (radius + 8) * Math.cos(rayAngle);
    const ry2 = cy + (radius + 8) * Math.sin(rayAngle);
    ctx.strokeStyle = DISCO_COLORS[i % DISCO_COLORS.length] + "CC";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx1, ry1);
    ctx.lineTo(rx2, ry2);
    ctx.stroke();
  }
}

function drawLetter(ctx: CanvasRenderingContext2D, letterObj: { char: string; color: string }) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  const fontSize = Math.round(SIZE * 0.78);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillText(letterObj.char, SIZE / 2 + 2, SIZE / 2 + 2);
  ctx.fillStyle = letterObj.color;
  ctx.fillText(letterObj.char, SIZE / 2, SIZE / 2);
}

export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document
      .querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']")
      .forEach((el) => el.remove());

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);

    const totalFrames = DISCO_FRAMES + LETTERS.length;
    let currentFrame = 0;
    let timerId: ReturnType<typeof setTimeout>;

    function nextFrame() {
      if (currentFrame < DISCO_FRAMES) {
        drawDiscoBall(ctx!, currentFrame);
      } else {
        drawLetter(ctx!, LETTERS[currentFrame - DISCO_FRAMES]);
      }
      link.href = canvas.toDataURL("image/png");
      const duration = currentFrame < DISCO_FRAMES ? DISCO_DURATION : LETTER_DURATION;
      currentFrame = (currentFrame + 1) % totalFrames;
      timerId = setTimeout(nextFrame, duration);
    }

    nextFrame();

    return () => {
      clearTimeout(timerId);
      link.remove();
    };
  }, []);

  return null;
}
