"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Config } from "@/lib/vitrine";
import { VitrineScene } from "./VitrineScene";

/**
 * The gate between the page and the GPU.
 *
 * "Performance first — 3D must never hurt load time" is a real constraint, and
 * a `<Canvas>` that mounts during hydration breaks it: compiling shaders and
 * building a cube map on the main thread competes directly with the paint that
 * the LCP is measured from. So:
 *
 *  1. The poster below renders in the server pass. It is plain CSS, it is what
 *     the reader sees first, and it is what LCP scores.
 *  2. The canvas mounts only once the hero is actually in view **and** the
 *     browser is idle. On a slow device that can be a second late; nobody
 *     notices, because the poster is already the same composition.
 *  3. It stops rendering entirely when scrolled away — a hero that keeps
 *     drawing at 60fps while you read the footer is just a battery leak.
 *
 * Under reduced motion the canvas never mounts at all. The poster is not a
 * degraded state; it is the same picture, held still.
 */

const IDLE = 200;

export function VitrineCanvas({ config }: { config: Config }) {
  const host = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = host.current;
    if (!el) return;

    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && !mounted) {
          // Wait for a quiet frame before handing work to the GPU.
          const schedule =
            typeof window.requestIdleCallback === "function"
              ? window.requestIdleCallback
              : (cb: () => void) => window.setTimeout(cb, IDLE);
          timer = schedule(() => setMounted(true)) as unknown as number;
        }
      },
      { rootMargin: "200px" },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduced, mounted]);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      {/* The poster. Server-rendered, always present, sits underneath the
          canvas so there is never a transparent frame during compile. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60% 46% at 50% 40%, ${config.vitrine.stone} 0%, transparent 72%),
            radial-gradient(120% 90% at 22% 8%, ${config.vitrine.key}14 0%, transparent 55%),
            ${config.vitrine.wall}
          `,
        }}
      />

      {mounted && !reduced && (
        <Canvas
          className="absolute inset-0"
          frameloop={visible ? "always" : "never"}
          dpr={degraded ? [1, 1] : [1, 1.75]}
          gl={{ antialias: !degraded, powerPreference: "high-performance", alpha: true }}
          camera={{ position: [0, 0.36, 5.25], fov: 30 }}
        >
          <PerformanceMonitor
            onDecline={() => setDegraded(true)}
            onIncline={() => setDegraded(false)}
          >
            <Suspense fallback={null}>
              <VitrineScene config={config} />
            </Suspense>
          </PerformanceMonitor>
        </Canvas>
      )}
    </div>
  );
}
