import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollTrigger caches every start/end offset the moment a trigger is created.
 * Triggers registered before a pinned section has claimed its extra scroll
 * height therefore cache offsets from a document thousands of pixels shorter
 * than the one the reader actually scrolls, which lands every section far too
 * early. There is no single "layout is settled" event to hang a recalculation
 * on, so this recalculates at each point where layout can still move:
 *
 *   - three timers, covering hydration and late-mounting client components
 *   - `load`, when the last subresource has landed
 *   - `fonts.ready`, because the display face swapping in changes every
 *     headline's height
 *
 * Refreshing is idempotent and cheap next to the class of bug it prevents.
 *
 * @returns a cleanup that removes every listener and timer it installed.
 */
export function scheduleScrollRefresh(): () => void {
  const refresh = () => ScrollTrigger.refresh();

  const timers = [250, 1200, 3000].map((ms) => window.setTimeout(refresh, ms));

  window.addEventListener("load", refresh);
  document.fonts?.ready.then(refresh).catch(() => {});

  return () => {
    timers.forEach(clearTimeout);
    window.removeEventListener("load", refresh);
  };
}
