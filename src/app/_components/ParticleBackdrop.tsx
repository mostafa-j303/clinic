"use client";
import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  color: string;
  hVelocity: number;
  vVelocity: number;
  dead: boolean;
};

export function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Slow, sparse, upward-drifting glow particles rendered on a canvas — reads as
// ambient light/mist behind the cards rather than a "screensaver" effect.
// Colors are derived from the live brand palette so it stays on-theme when the
// admin changes Primary/Accent Color in Settings.
export default function ParticleBackdrop({
  colors,
  className,
}: {
  colors: [string, string, string];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Density scales with the section's actual area so a very tall section
    // (many rows of cards) still gets particles spread across its whole
    // height instead of just the first viewport of it.
    let maxParticles = 60;
    const particlesPerFrame = 1;
    const sizeRange: [number, number] = [10, 34];
    const velocityRange: [number, number] = [0.15, 0.5];

    const resize = () => {
      const parent = canvas.parentElement;
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxRef.current = ctx;
      // ~1 particle per 24,000px^2 of section area, capped so it never gets too busy.
      maxParticles = Math.min(220, Math.max(60, Math.round((width * height) / 24000)));
    };

    const randomBetween = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const cssSize = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      return {
        width: canvas.width / dpr,
        height: canvas.height / dpr,
      };
    };

    // Spawns anywhere across the full section height (not just the bottom edge) so
    // replenished particles keep the whole section populated, not only a band near
    // wherever they entered from — at a slow drift speed, entering only from the
    // bottom would take far too long to ever cover a tall, multi-row section.
    const spawnParticle = () => {
      const { width, height } = cssSize();
      const palette = colorsRef.current;
      const color = palette[Math.floor(Math.random() * palette.length)];
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: randomBetween(sizeRange[0], sizeRange[1]),
        color,
        hVelocity: randomBetween(-0.15, 0.15),
        vVelocity: randomBetween(velocityRange[0], velocityRange[1]),
        dead: false,
      });
    };

    const draw = () => {
      const ctx = ctxRef.current;
      if (!ctx) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const { width, height } = cssSize();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.dead) {
          particles.splice(i, 1);
          i--;
          continue;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        p.x += p.hVelocity;
        p.y -= p.vVelocity;

        if (p.y + p.size < 0) p.dead = true;
      }

      if (particles.length < maxParticles) {
        for (let i = 0; i < particlesPerFrame; i++) spawnParticle();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    particlesRef.current = [];
    for (let i = 0; i < maxParticles; i++) spawnParticle();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, []);

  // Fades the whole layer out near the top/bottom edges so it blends into the
  // section's own background there instead of ending on a hard color seam
  // against the section above/below.
  const fade = {
    WebkitMaskImage:
      "linear-gradient(to bottom, transparent 0%, black 14%, black 88%, transparent 100%)",
    maskImage:
      "linear-gradient(to bottom, transparent 0%, black 14%, black 88%, transparent 100%)",
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none opacity-70 dark:opacity-50 ${className ?? ""}`}
      style={fade}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
