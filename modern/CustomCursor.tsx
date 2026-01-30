import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CURSOR_SIZE = 8;
const CURSOR_SIZE_HOVER = 24;
const MAGNETIC_STRENGTH = 0.15;
const MOBILE_BREAKPOINT = 768;
const LERP = 0.18;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const hoverTarget = useRef<HTMLElement | null>(null);
  const scaleRef = useRef(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < MOBILE_BREAKPOINT) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    setMounted(true);

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const handleLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;
      if (!hoverTarget.current?.contains(related)) hoverTarget.current = null;
    };

    const tick = () => {
      const hoverEl = hoverTarget.current;
      let tx = target.current.x;
      let ty = target.current.y;

      if (hoverEl) {
        const rect = hoverEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        tx += (cx - tx) * MAGNETIC_STRENGTH;
        ty += (cy - ty) * MAGNETIC_STRENGTH;
      }

      pos.current.x += (tx - pos.current.x) * LERP;
      pos.current.y += (ty - pos.current.y) * LERP;

      const scale = hoverEl ? CURSOR_SIZE_HOVER / CURSOR_SIZE : 1;
      scaleRef.current += (scale - scaleRef.current) * 0.15;

      gsap.set(dot, {
        x: pos.current.x - (CURSOR_SIZE * scaleRef.current) / 2,
        y: pos.current.y - (CURSOR_SIZE * scaleRef.current) / 2,
        scale: scaleRef.current,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    const sel = "a, button, [role='button'], .cursor-hover, [data-cursor-hover], .project-item, .item, .testi-item";
    const handleOver = (e: MouseEvent) => {
      hoverTarget.current = (e.target as HTMLElement).closest(sel);
    };
    document.documentElement.addEventListener("mouseover", handleOver, true);
    document.documentElement.addEventListener("mouseout", handleLeave, true);
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseover", handleOver, true);
      document.documentElement.removeEventListener("mouseout", handleLeave, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (mounted) document.body.classList.add("custom-cursor-active");
    return () => document.body.classList.remove("custom-cursor-active");
  }, [mounted]);

  return (
    <>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full bg-foreground pointer-events-none z-[9999] will-change-transform origin-center ${!mounted ? "opacity-0" : ""}`}
        style={{
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
        }}
        aria-hidden
      />
      <style>{`
        @media (min-width: ${MOBILE_BREAKPOINT}px) and (prefers-reduced-motion: no-preference) {
          body.custom-cursor-active * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
