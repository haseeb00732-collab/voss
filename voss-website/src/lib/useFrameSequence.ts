'use client';

import { useEffect, useRef, useState } from 'react';
import { detectTier, type Tier } from './tier';

/**
 * 48 frames, extracted from the hero clip at 12fps by ffmpeg. The count here
 * and the files on disk must agree; regenerate both together.
 */
export const FRAME_COUNT = 48;

/**
 * Which set of frames this viewport should actually decode.
 *
 * Orientation matters more than tier here. The clip is 16:9, and cover-cropping
 * a landscape frame into a portrait phone throws away most of its width and
 * upscales what is left, which is what made the bag look soft. A portrait crop
 * of the same footage is rendered separately (`p*`) and used whenever the
 * viewport is taller than it is wide.
 *
 * Widths are chosen against devicePixelRatio, not CSS pixels: a full-bleed
 * hero on a 1200px DPR-2 screen needs ~2400 device pixels, so 1280 was a 2x
 * upscale even on desktop.
 */
export function frameSet(tier: Tier) {
  if (typeof window === 'undefined') return { poster: 'w1280', frames: 'w1280' };
  const portrait = window.innerHeight > window.innerWidth;

  /**
   * The poster and the sequence have different jobs, so they get different
   * resolutions.
   *
   * The poster is a STILL. It is the first thing seen, it is the LCP element,
   * and it is examined at rest, so it gets the highest resolution available.
   *
   * The sequence is in MOTION, and every frame is a decoded bitmap held in
   * memory: at 1920x1080 that is 8.3 MB each, and 48 of them is ~400 MB. That
   * is not a performance nicety, it is enough to thrash or kill a mid-tier
   * phone, and it measured 32fps median under a 4x CPU throttle. At 1280 the
   * same set is ~175 MB and each blit is 44% fewer pixels. Motion hides the
   * softness the still would have revealed.
   */
  if (portrait) return { poster: 'p1080', frames: tier >= 3 ? 'p900' : 'p600' };
  return { poster: 'w1920', frames: tier >= 3 ? 'w1280' : 'w720' };
}

const src = (set: string, i: number) =>
  `/sequence/reveal/${set}/f${String(i).padStart(2, '0')}.avif`;

export type SequenceState = {
  tier: Tier;
  /** frame 0 only — this is the LCP image and loads with the document */
  poster: string;
  /** true once every frame is decoded and scrubbing is safe */
  ready: boolean;
  /** 0 → 1 of the sequence, for callers that want to show progress */
  loaded: number;
};

/**
 * Loads the reveal sequence into decoded ImageBitmaps, then hands back a
 * draw(progress) function. Nothing is fetched until after the window load
 * event, so the sequence never competes with LCP.
 */
export function useFrameSequence(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [state, setState] = useState<SequenceState>(() => ({
    tier: 2,
    poster: src('w1280', 0),
    ready: false,
    loaded: 0,
  }));

  const frames = useRef<(ImageBitmap | HTMLImageElement)[]>([]);
  const drawn = useRef(-1);
  const raf = useRef(0);
  const target = useRef(0);

  // ── resolve tier on the client, then preload after load ──────────────────
  useEffect(() => {
    const tier = detectTier();
    const set = frameSet(tier);
    const w = set.frames;
    setState((s) => ({ ...s, tier, poster: src(set.poster, 0) }));

    if (tier === 1) return; // essential tier never fetches the sequence

    let cancelled = false;

    const load = async () => {
      let done = 0;
      const jobs = Array.from({ length: FRAME_COUNT }, async (_, i) => {
        const res = await fetch(src(w, i));
        const blob = await res.blob();
        const bmp =
          'createImageBitmap' in window
            ? await createImageBitmap(blob)
            : await new Promise<HTMLImageElement>((ok, no) => {
                const img = new Image();
                img.onload = () => ok(img);
                img.onerror = no;
                img.src = URL.createObjectURL(blob);
              });
        if (cancelled) return;
        frames.current[i] = bmp;
        done += 1;
        if (done % 6 === 0 || done === FRAME_COUNT) {
          setState((s) => ({ ...s, loaded: done / FRAME_COUNT }));
        }
      });
      await Promise.all(jobs);
      if (!cancelled) setState((s) => ({ ...s, ready: true, loaded: 1 }));
    };

    // idle + post-load: the sequence is never in the critical path
    const kick = () => {
      if ('requestIdleCallback' in window) {
        (window as Window & typeof globalThis).requestIdleCallback(() => void load(), { timeout: 1200 });
      } else {
        setTimeout(() => void load(), 200);
      }
    };
    if (document.readyState === 'complete') kick();
    else window.addEventListener('load', kick, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', kick);
    };
  }, []);

  // ── paint loop: one draw per frame, only when the index actually changes ─
  useEffect(() => {
    if (!state.ready) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d', { alpha: false });
    if (!ctx) return;

    const first = frames.current[0];
    if (!first) return;
    cv.width = 'width' in first ? first.width : 480;
    cv.height = 'height' in first ? first.height : 592;

    const paint = () => {
      const i = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(target.current * (FRAME_COUNT - 1))),
      );
      if (i !== drawn.current) {
        const f = frames.current[i];
        if (f) {
          ctx.drawImage(f as CanvasImageSource, 0, 0, cv.width, cv.height);
          drawn.current = i;
        }
      }
      raf.current = requestAnimationFrame(paint);
    };
    raf.current = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf.current);
  }, [state.ready, canvasRef]);

  /** call from a scroll handler; cheap, just stores a number */
  const setProgress = (p: number) => {
    target.current = p;
  };

  return { ...state, setProgress };
}
