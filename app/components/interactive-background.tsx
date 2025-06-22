"use client";
import { useEffect, useRef } from "react";

// Utility to interpolate between two colors
function lerpColor(a: string, b: string, t: number) {
  const ah = parseInt(a.replace('#', ''), 16),
    ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff,
    bh = parseInt(b.replace('#', ''), 16),
    br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff,
    rr = ar + t * (br - ar),
    rg = ag + t * (bg - ag),
    rb = ab + t * (bb - ab);
  return `rgb(${rr|0},${rg|0},${rb|0})`;
}

// Even darker palette, mostly near-black
const COLORS = ["#181d1b", "#232823", "#111513", "#181a19", "#181818", "#0a0a0a"];

export default function InteractiveBackground() {
  const bgRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let frame: number;
    function animate() {
      timeRef.current += 0.008;
      const t = timeRef.current;
      // Animate two gradient centers
      const x1 = 50 + 18 * Math.sin(t + 1) + mouse.current.x * 10;
      const y1 = 50 + 18 * Math.cos(t + 2) + mouse.current.y * 10;
      const x2 = 50 + 15 * Math.cos(t / 2 + 3) - mouse.current.x * 8;
      const y2 = 50 + 13 * Math.sin(t / 2 + 4) - mouse.current.y * 8;
      // Animate color stops (darker blends)
      const colorA = lerpColor(COLORS[0], COLORS[1], (Math.sin(t) + 1) / 2);
      const colorB = lerpColor(COLORS[2], COLORS[3], (Math.cos(t / 2) + 1) / 2);
      const colorC = lerpColor(COLORS[4], COLORS[5], (Math.sin(t / 3) + 1) / 2);
      if (bgRef.current) {
        bgRef.current.style.background = `
          radial-gradient(ellipse 20% 15% at ${x1}% ${y1}%, ${colorA} 0%, transparent 70%),
          radial-gradient(ellipse 18% 13% at ${x2}% ${y2}%, ${colorB} 0%, transparent 70%),
          radial-gradient(ellipse 80% 80% at 50% 50%, ${colorC} 0%, #0a0a0a 100%)
        `;
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 -z-10 pointer-events-none transition-all duration-300"
      style={{
        background: "radial-gradient(ellipse 20% 15% at 50% 50%, #181d1b 0%, transparent 70%),radial-gradient(ellipse 18% 13% at 50% 50%, #111513 0%, transparent 70%),radial-gradient(ellipse 80% 80% at 50% 50%, #181818 0%, #0a0a0a 100%)",
        transition: "background 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
      aria-hidden="true"
    />
  );
} 