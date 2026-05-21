import React, { useEffect, useMemo, useRef } from "react";

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

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

function mix(a, b, t) {
  return a + (b - a) * t;
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function rgba(r, g, b, a) {
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
}

function drawStar(ctx, x, y, r, a) {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawNebula(ctx, w, h, t, spaceMix) {
  // Deep space gradient
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#060617");
  g.addColorStop(0.5, "#0a0b27");
  g.addColorStop(1, "#071026");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Animated nebula clouds (soft blobs)
  const blobs = 8;
  for (let i = 0; i < blobs; i++) {
    const k = i / blobs;
    const cx = w * (0.15 + 0.75 * k) + Math.sin(t * 0.00025 + i) * w * 0.04;
    const cy = h * (0.2 + 0.55 * Math.sin(i * 2.2 + 1.1) * 0.08) + Math.cos(t * 0.00022 + i) * h * 0.05;
    const r = mix(w * 0.18, w * 0.3, (Math.sin(t * 0.0003 + i) + 1) / 2);
    const a = 0.10 * spaceMix;
    const col = i % 3 === 0 ? [255, 62, 165] : i % 3 === 1 ? [37, 214, 255] : [124, 92, 255];
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, rgba(col[0], col[1], col[2], a));
    grad.addColorStop(1, rgba(col[0], col[1], col[2], 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawStarsAndMeteors(ctx, w, h, t, stars, meteors, spaceMix) {
  // Stars twinkle
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * 0.002 + s.tw);
    drawStar(ctx, s.x, s.y, s.r, s.a * tw * spaceMix);
  }

  // Meteors
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const m of meteors) {
    const dt = (t - m.t0) / m.dur;
    const p = clamp01(dt);
    const alive = dt >= 0 && dt <= 1;
    if (!alive) continue;
    const x = mix(m.x0, m.x1, p);
    const y = mix(m.y0, m.y1, p);
    const dx = m.x1 - m.x0;
    const dy = m.y1 - m.y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    const tail = 120;
    const x2 = x - nx * tail;
    const y2 = y - ny * tail;
    const grad = ctx.createLinearGradient(x2, y2, x, y);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, `rgba(255,255,255,${0.85 * spaceMix})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(255, 110, 200, ${alpha})`;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size * 0.5, y - size * 0.6, x - size, y + size * 0.2, x, y + size);
  ctx.bezierCurveTo(x + size, y + size * 0.2, x + size * 0.5, y - size * 0.6, x, y);
  ctx.fill();
  ctx.restore();
}

function drawDolphin(ctx, x, y, scale, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);
  const body = ctx.createLinearGradient(-44, -10, 44, 18);
  body.addColorStop(0, "rgba(200,240,255,0.94)");
  body.addColorStop(1, "rgba(110,190,240,0.32)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(44, 2, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(120,200,255,0.36)";
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.quadraticCurveTo(8, -34, 20, -12);
  ctx.quadraticCurveTo(10, -12, -4, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-44, 0);
  ctx.quadraticCurveTo(-68, -12, -82, -2);
  ctx.quadraticCurveTo(-68, 12, -44, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.arc(24, -4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWhale(ctx, x, y, scale, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);
  const body = ctx.createLinearGradient(-72, -18, 72, 18);
  body.addColorStop(0, "rgba(80,150,220,0.95)");
  body.addColorStop(1, "rgba(52,94,158,0.95)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 72, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(220,250,255,0.9)";
  ctx.beginPath();
  ctx.ellipse(-30, -8, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(72, 2);
  ctx.lineTo(92, -18);
  ctx.lineTo(92, 18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSeahorse(ctx, x, y, scale, dir, ph) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);
  const bodyCol = ctx.createLinearGradient(-8, -24, 18, 26);
  bodyCol.addColorStop(0, "rgba(255, 195, 130, 0.95)");
  bodyCol.addColorStop(1, "rgba(210, 140, 80, 0.85)");
  ctx.fillStyle = bodyCol;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.quadraticCurveTo(18, -20, 12, 0);
  ctx.quadraticCurveTo(4, 18, 12, 34);
  ctx.quadraticCurveTo(6, 42, -6, 38);
  ctx.quadraticCurveTo(-16, 34, -12, 24);
  ctx.quadraticCurveTo(-6, 14, 0, 12);
  ctx.quadraticCurveTo(8, 10, 4, -4);
  ctx.quadraticCurveTo(-4, -10, 0, -24);
  ctx.fill();
  ctx.fillStyle = "rgba(125, 80, 45, 0.84)";
  ctx.beginPath();
  ctx.arc(-8, -18, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawJellyfish(ctx, x, y, scale, phase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const bell = ctx.createRadialGradient(0, -10, 0, 0, -10, 24);
  bell.addColorStop(0, "rgba(195, 180, 255, 0.9)");
  bell.addColorStop(1, "rgba(110, 120, 255, 0.16)");
  ctx.fillStyle = bell;
  ctx.beginPath();
  ctx.ellipse(0, -10, 24, 18, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.36;
  for (let i = -2; i <= 2; i++) {
    const sway = Math.sin(phase + i * 0.7) * 4;
    ctx.beginPath();
    ctx.moveTo(i * 8, 2);
    ctx.quadraticCurveTo(i * 8 + sway, 16, i * 8, 28);
    ctx.strokeStyle = "rgba(220, 220, 255, 0.32)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawStarfish(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255, 150, 110, 0.92)";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const theta = (i * 2 * Math.PI) / 5;
    const r = i % 2 === 0 ? 10 : 4;
    const px = Math.cos(theta) * r;
    const py = Math.sin(theta) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCoral(ctx, x, y, scale, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = `rgba(${hue}, 90, 140, 0.85)`;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const theta = -Math.PI / 2 + (i - 2) * 0.24;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(theta) * 10, -20 + i * 4, Math.cos(theta) * 12, -32 + i * 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeagrass(ctx, w, h, t, grass, seaMix) {
  ctx.save();
  ctx.globalAlpha = 0.82 * seaMix;
  ctx.strokeStyle = `rgba(36, 190, 145, ${0.24 * seaMix})`;
  ctx.lineWidth = 2;
  for (const blade of grass) {
    const sway = Math.sin(t * 0.0013 + blade.ph) * blade.sway;
    ctx.beginPath();
    const baseX = blade.x;
    const baseY = h + 10;
    ctx.moveTo(baseX, baseY);
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const yy = baseY - (blade.len * i) / steps;
      const xx = baseX + sway * (i / steps);
      ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeaTurtle(ctx, x, y, scale, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);

  const shell = ctx.createRadialGradient(0, 0, 0, 0, 0, 32);
  shell.addColorStop(0, "rgba(121, 204, 153, 0.95)");
  shell.addColorStop(0.6, "rgba(74, 142, 102, 0.95)");
  shell.addColorStop(1, "rgba(64, 118, 92, 0.95)");
  ctx.fillStyle = shell;
  ctx.beginPath();
  ctx.ellipse(0, 0, 36, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(210, 255, 220, 0.92)";
  ctx.beginPath();
  ctx.ellipse(-6, -2, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, -2, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(105, 185, 145, 0.95)";
  const flipper = (ox, oy, sx, sy) => {
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.quadraticCurveTo(ox + sx * 0.7, oy + sy * 0.3, ox + sx, oy + sy);
    ctx.quadraticCurveTo(ox + sx * 0.2, oy + sy * 0.6, ox, oy);
    ctx.fill();
  };
  flipper(-28, -4, -18, -12);
  flipper(-28, 4, -18, 12);
  flipper(28, -4, 18, -12);
  flipper(28, 4, 18, 12);

  ctx.fillStyle = "rgba(48, 80, 62, 0.9)";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 8, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawUnderwater(ctx, w, h, t, seaMix, dolphins, turtles, whales, seahorses, starfish, corals, jellyfish, seagrass, bubbles) {
  // Sea gradient
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#041528");
  g.addColorStop(0.45, "#042f57");
  g.addColorStop(1, "#02131d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft depth glow
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.25, h * 0.8);
  glow.addColorStop(0, `rgba(90, 190, 255, ${0.14 * seaMix})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Light rays
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 6; i++) {
    const x = w * (0.1 + i * 0.14) + Math.sin(t * 0.0003 + i) * w * 0.02;
    const rayW = w * (0.18 + 0.05 * Math.sin(t * 0.0007 + i));
    const grad = ctx.createLinearGradient(x, 0, x + rayW, h);
    grad.addColorStop(0, "rgba(37,214,255,0)");
    grad.addColorStop(0.4, `rgba(37,214,255,${0.12 * seaMix})`);
    grad.addColorStop(1, "rgba(37,214,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - rayW, 0, rayW * 2.2, h);
  }
  ctx.restore();

  drawSeagrass(ctx, w, h, t, seagrass, seaMix);

  // Coral clusters
  ctx.save();
  ctx.globalAlpha = 0.9 * seaMix;
  for (const coral of corals) {
    drawCoral(ctx, coral.x * w, h - coral.baseHeight, coral.scale, coral.hue);
  }
  ctx.restore();

  // Starfish on the ocean floor
  ctx.save();
  ctx.globalAlpha = 0.9 * seaMix;
  for (const star of starfish) {
    drawStarfish(ctx, star.x * w, h - star.bottomOffset, 0.66 + 0.24 * Math.sin(t * 0.0013 + star.ph));
  }
  ctx.restore();

  // Whales
  ctx.save();
  ctx.globalAlpha = 0.88 * seaMix;
  for (const wobj of whales) {
    const p = ((t - wobj.t0) / wobj.period) % 1;
    const x = wobj.dir > 0 ? mix(-140, w + 140, p) : mix(w + 140, -140, p);
    const y = wobj.y + Math.sin(t * 0.0009 + wobj.ph) * 14;
    const scale = 1.05 + 0.15 * Math.sin(t * 0.0007 + wobj.ph);
    drawWhale(ctx, x, y, scale, wobj.dir);
  }
  ctx.restore();

  // Turtles
  ctx.save();
  ctx.globalAlpha = 0.95 * seaMix;
  for (const turt of turtles) {
    const p = ((t - turt.t0) / turt.period) % 1;
    const x = turt.dir > 0 ? mix(-120, w + 120, p) : mix(w + 120, -120, p);
    const y = turt.y + Math.sin(t * 0.001 + turt.ph) * 10;
    const scale = 0.72 + 0.18 * Math.sin(t * 0.0016 + turt.ph);
    drawSeaTurtle(ctx, x, y, scale, turt.dir);
  }
  ctx.restore();

  // Dolphins
  ctx.save();
  ctx.globalAlpha = 0.96 * seaMix;
  for (const d of dolphins) {
    const p = ((t - d.t0) / d.period) % 1;
    const x = d.dir > 0 ? mix(-100, w + 100, p) : mix(w + 100, -100, p);
    const y = d.y + Math.sin(t * 0.0014 + d.ph) * 10;
    const scale = 0.84 + 0.16 * Math.sin(t * 0.0014 + d.ph);
    drawDolphin(ctx, x, y, scale, d.dir);
  }
  ctx.restore();

  // Seahorses
  ctx.save();
  ctx.globalAlpha = 0.92 * seaMix;
  for (const s of seahorses) {
    const p = ((t - s.t0) / s.period) % 1;
    const x = mix(w * 0.18, w * 0.78, p);
    const y = s.y + Math.sin(t * 0.0018 + s.ph) * 12;
    const scale = 0.55 + 0.18 * Math.sin(t * 0.0015 + s.ph);
    drawSeahorse(ctx, x, y, scale, s.dir, t * 0.001 + s.ph);
  }
  ctx.restore();

  // Jellyfish
  ctx.save();
  ctx.globalAlpha = 0.82 * seaMix;
  for (const j of jellyfish) {
    const p = ((t - j.t0) / j.period) % 1;
    const x = mix(w * 0.12, w * 0.88, p);
    const y = j.y + Math.sin(t * 0.0012 + j.ph) * 18;
    drawJellyfish(ctx, x, y, 0.55 + 0.18 * Math.sin(t * 0.0017 + j.ph), t * 0.002 + j.ph);
  }
  ctx.restore();

  // Bubbles
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const b of bubbles) {
    const dt = ((t - b.t0) / b.period) % 1;
    const y = h + 30 - dt * (h + 120);
    const x = b.x + Math.sin(t * 0.0012 + b.ph) * 14;
    const r = b.r * (0.7 + 0.3 * Math.sin(t * 0.002 + b.ph));
    ctx.strokeStyle = `rgba(200,250,255,${0.22 * seaMix})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export default function SpaceToSeaScene({ progress = 0, className }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const {
    stars,
    meteors,
    dolphins,
    turtles,
    whales,
    seahorses,
    starfish,
    corals,
    jellyfish,
    seagrass,
    bubbles
  } = useMemo(() => {
    const rnd = mulberry32(1337);
    const starsArr = Array.from({ length: 220 }, () => ({
      x: rnd(),
      y: rnd(),
      r: 0.6 + rnd() * 1.6,
      a: 0.35 + rnd() * 0.55,
      tw: rnd() * Math.PI * 2
    }));
    const meteorsArr = Array.from({ length: 12 }, () => {
      const t0 = rnd() * 20000;
      const dur = 1200 + rnd() * 1400;
      const x0 = rnd() * 1.1;
      const y0 = rnd() * 0.6;
      return {
        t0,
        dur,
        x0,
        y0,
        x1: x0 + 0.28 + rnd() * 0.26,
        y1: y0 + 0.22 + rnd() * 0.22
      };
    });
    const dolphinsArr = Array.from({ length: 8 }, (_, i) => ({
      y: 140 + i * 36,
      dir: i % 2 === 0 ? 1 : -1,
      t0: rnd() * 3800,
      period: 6000 + rnd() * 5200,
      ph: rnd() * Math.PI * 2
    }));
    const turtlesArr = Array.from({ length: 6 }, (_, i) => ({
      y: 120 + i * 48,
      dir: i % 2 === 0 ? 1 : -1,
      t0: rnd() * 4200,
      period: 7600 + rnd() * 6200,
      ph: rnd() * Math.PI * 2
    }));
    const whalesArr = Array.from({ length: 2 }, (_, i) => ({
      y: 170 + i * 110,
      dir: i % 2 === 0 ? 1 : -1,
      t0: rnd() * 8000,
      period: 12000 + rnd() * 5600,
      ph: rnd() * Math.PI * 2
    }));
    const seahorsesArr = Array.from({ length: 7 }, (_, i) => ({
      y: 260 + i * 35,
      dir: i % 2 === 0 ? 1 : -1,
      t0: rnd() * 5200,
      period: 9000 + rnd() * 5200,
      ph: rnd() * Math.PI * 2
    }));
    const starfishArr = Array.from({ length: 10 }, () => ({
      x: rnd(),
      bottomOffset: 44 + rnd() * 32,
      ph: rnd() * Math.PI * 2
    }));
    const coralsArr = Array.from({ length: 9 }, () => ({
      x: rnd(),
      baseHeight: 48 + rnd() * 26,
      scale: 0.62 + rnd() * 0.32,
      hue: 180 + rnd() * 80
    }));
    const jellyfishArr = Array.from({ length: 9 }, () => ({
      y: 80 + rnd() * 180,
      t0: rnd() * 5200,
      period: 8400 + rnd() * 5600,
      ph: rnd() * Math.PI * 2
    }));
    const seagrassArr = Array.from({ length: 24 }, () => ({
      x: rnd(),
      len: 110 + rnd() * 120,
      sway: 12 + rnd() * 30,
      ph: rnd() * Math.PI * 2
    }));
    const bubblesArr = Array.from({ length: 40 }, () => ({
      x: rnd(),
      r: 2.5 + rnd() * 6,
      t0: rnd() * 4000,
      period: 4200 + rnd() * 5200,
      ph: rnd() * Math.PI * 2
    }));
    return {
      stars: starsArr,
      meteors: meteorsArr,
      dolphins: dolphinsArr,
      turtles: turtlesArr,
      whales: whalesArr,
      seahorses: seahorsesArr,
      starfish: starfishArr,
      corals: coralsArr,
      jellyfish: jellyfishArr,
      seagrass: seagrassArr,
      bubbles: bubblesArr
    };
  }, []);

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

    let start = performance.now();
    const tick = (t) => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      const p = clamp01(progress);
      const spaceMix = 1 - smoothStep(clamp01(p * 1.05));
      const seaMix = smoothStep(clamp01((p - 0.18) * 1.05));

      drawNebula(ctx, w, h, t, spaceMix);
      drawStarsAndMeteors(
        ctx,
        w,
        h,
        t - start,
        stars.map((s) => ({ ...s, x: s.x * w, y: s.y * h })),
        meteors.map((m) => ({
          ...m,
          x0: m.x0 * w,
          y0: m.y0 * h,
          x1: m.x1 * w,
          y1: m.y1 * h
        })),
        spaceMix
      );

      if (seaMix > 0.01) {
        // Crossfade overlay into underwater
        ctx.save();
        ctx.globalAlpha = seaMix;
        drawUnderwater(
          ctx,
          w,
          h,
          t - start,
          seaMix,
          dolphins.map((d) => ({ ...d, y: d.y + h * 0.18 })),
          turtles.map((d) => ({ ...d, y: d.y + h * 0.18 })),
          whales.map((wobj) => ({ ...wobj, y: wobj.y + h * 0.16 })),
          seahorses.map((s) => ({ ...s, y: s.y + h * 0.26 })),
          starfish.map((s) => ({ ...s, x: s.x * w })),
          corals.map((c) => ({ ...c, x: c.x * w })),
          jellyfish.map((j) => ({ ...j, y: j.y + h * 0.08 })),
          seagrass.map((g) => ({ ...g, x: g.x * w })),
          bubbles.map((b) => ({ ...b, x: b.x * w }))
        );
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
}, [progress, stars, meteors, dolphins, turtles, whales, seahorses, starfish, corals, jellyfish, seagrass, bubbles]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

