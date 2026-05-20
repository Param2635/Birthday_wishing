import React, { useEffect, useRef } from "react";

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

function pick(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}

export default function ConfettiCanvas({ enabled, seed, className }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const confettiRef = useRef([]);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });

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
      sizeRef.current = { w, h, dpr };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!enabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const rnd = mulberry32(12345 + seed * 99991);
    const colors = [
      "#ff3ea5",
      "#7c5cff",
      "#25d6ff",
      "#ffd166",
      "#06d6a0",
      "#ff5d5d"
    ];

    const makePiece = () => {
      const { w, h } = sizeRef.current;
      const size = 6 + rnd() * 10;
      return {
        x: rnd() * w,
        y: -20 - rnd() * h * 0.2,
        vx: -0.6 + rnd() * 1.2,
        vy: 1.2 + rnd() * 2.8,
        rot: rnd() * Math.PI,
        vr: -0.12 + rnd() * 0.24,
        size,
        wobble: rnd() * Math.PI * 2,
        wobbleSpeed: 0.02 + rnd() * 0.05,
        color: pick(colors, rnd),
        shape: rnd() < 0.2 ? "circle" : "rect"
      };
    };

    const count = 160;
    confettiRef.current = Array.from({ length: count }, makePiece);
    let last = performance.now();

    const tick = (t) => {
      const dt = Math.min(32, t - last);
      last = t;

      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      for (const p of confettiRef.current) {
        p.wobble += p.wobbleSpeed * dt;
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        p.rot += p.vr * dt * 0.06;

        const sway = Math.sin(p.wobble) * 10;
        const x = p.x + sway;

        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.95;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }
        ctx.restore();

        if (p.y > h + 30) {
          Object.assign(p, makePiece(), { y: -20 });
        }
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, seed]);

  return <canvas ref={canvasRef} className={className} />;
}

