import React, { useEffect, useMemo, useRef } from "react";

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rgba(r, g, b, a) {
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
}

function drawStars(ctx, w, h, t, stars, alpha = 1) {
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * 0.002 + s.tw);
    ctx.fillStyle = `rgba(255,255,255,${s.a * tw * alpha})`;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawNebulaBloom(ctx, w, h, t, rnd) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#070717");
  g.addColorStop(1, "#0b0d2a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 7; i++) {
    const cx = w * (0.2 + 0.6 * (i / 7)) + Math.sin(t * 0.0003 + i) * w * 0.08;
    const cy = h * (0.2 + 0.6 * rnd()) + Math.cos(t * 0.00025 + i) * h * 0.06;
    const r = w * (0.22 + 0.2 * rnd());
    const col =
      i % 3 === 0 ? [255, 62, 165] : i % 3 === 1 ? [37, 214, 255] : [124, 92, 255];
    const a = 0.18;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, rgba(col[0], col[1], col[2], a));
    grad.addColorStop(1, rgba(col[0], col[1], col[2], 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawDeepOcean(ctx, w, h, t, rnd) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#041a38");
  g.addColorStop(1, "#020b1a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Light rays
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 5; i++) {
    const x = w * (0.1 + i * 0.2) + Math.sin(t * 0.0004 + i) * w * 0.03;
    const rayW = w * (0.18 + 0.05 * Math.sin(t * 0.0007 + i));
    const grad = ctx.createLinearGradient(x, 0, x + rayW, h);
    grad.addColorStop(0, "rgba(37,214,255,0)");
    grad.addColorStop(0.5, "rgba(37,214,255,0.18)");
    grad.addColorStop(1, "rgba(37,214,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - rayW, 0, rayW * 2.2, h);
  }
  ctx.restore();

  // Bubbles
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 16; i++) {
    const ph = i * 0.7;
    const p = ((t * 0.00012 + ph) % 1 + 1) % 1;
    const x = w * (0.08 + 0.84 * rnd()) + Math.sin(t * 0.001 + ph) * 8;
    const y = h + 20 - p * (h + 60);
    const r = 2 + 6 * rnd();
    ctx.strokeStyle = "rgba(200,250,255,0.22)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAurora(ctx, w, h, t) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#050518");
  g.addColorStop(1, "#0b1230");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 4; i++) {
    const y = h * (0.2 + i * 0.12);
    const amp = 16 + i * 8;
    const grad = ctx.createLinearGradient(0, y, w, y);
    grad.addColorStop(0, "rgba(37,214,255,0)");
    grad.addColorStop(0.4, "rgba(6,214,160,0.35)");
    grad.addColorStop(0.7, "rgba(124,92,255,0.28)");
    grad.addColorStop(1, "rgba(255,62,165,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16 + i * 10;
    ctx.beginPath();
    for (let x = -20; x <= w + 20; x += 22) {
      const yy = y + Math.sin(t * 0.0008 + x * 0.01 + i) * amp;
      if (x < 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawGalaxyCake(ctx, w, h, t) {
  // Starry background
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#070717");
  g.addColorStop(1, "#0a0b25");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Cake (simple + cosmic gradient)
  const cx = w * 0.5;
  const baseY = h * 0.78;
  const cakeW = w * 0.58;
  const cakeH = h * 0.28;

  const cakeGrad = ctx.createLinearGradient(cx - cakeW / 2, baseY - cakeH, cx + cakeW / 2, baseY);
  cakeGrad.addColorStop(0, "#7c5cff");
  cakeGrad.addColorStop(0.45, "#ff3ea5");
  cakeGrad.addColorStop(1, "#25d6ff");

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 10, cakeW * 0.48, cakeH * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = cakeGrad;
  ctx.beginPath();
  ctx.roundRect(cx - cakeW / 2, baseY - cakeH, cakeW, cakeH, 20);
  ctx.fill();

  // Icing drip
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath();
  ctx.roundRect(cx - cakeW / 2, baseY - cakeH, cakeW, cakeH * 0.35, 20);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const x = cx - cakeW / 2 + (i + 0.5) * (cakeW / 8);
    const drip = cakeH * (0.08 + 0.08 * Math.sin(t * 0.001 + i));
    ctx.beginPath();
    ctx.roundRect(x - 12, baseY - cakeH + cakeH * 0.28, 24, drip, 12);
    ctx.fill();
  }

  // Candle + flame
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.roundRect(cx - 8, baseY - cakeH - 38, 16, 42, 8);
  ctx.fill();

  const flick = 0.7 + 0.3 * Math.sin(t * 0.01);
  const flameGrad = ctx.createRadialGradient(cx, baseY - cakeH - 48, 0, cx, baseY - cakeH - 48, 22);
  flameGrad.addColorStop(0, `rgba(255,209,102,${0.95 * flick})`);
  flameGrad.addColorStop(0.6, `rgba(255,62,165,${0.35 * flick})`);
  flameGrad.addColorStop(1, "rgba(255,62,165,0)");
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - cakeH - 50, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
}

export default function ArtFrame({ variant, className, seed = 1 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const stars = useMemo(() => {
    const rnd = mulberry32(9000 + seed * 97);
    return Array.from({ length: 70 }, () => ({
      x: rnd(),
      y: rnd(),
      r: 0.5 + rnd() * 1.2,
      a: 0.25 + rnd() * 0.6,
      tw: rnd() * Math.PI * 2
    }));
  }, [seed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);

    const rnd = mulberry32(420 + seed * 17);
    const tick = (t) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      if (variant === "nebula") drawNebulaBloom(ctx, w, h, t, rnd);
      else if (variant === "ocean") drawDeepOcean(ctx, w, h, t, rnd);
      else if (variant === "aurora") drawAurora(ctx, w, h, t);
      else drawGalaxyCake(ctx, w, h, t);

      // Subtle vignette
      const v = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.05, w * 0.5, h * 0.45, w * 0.78);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);

      // Star overlay
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      drawStars(ctx, w, h, t, stars, clamp01(0.9));
      ctx.restore();

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
  }, [variant, seed, stars]);

  return <canvas ref={canvasRef} className={className} />;
}

