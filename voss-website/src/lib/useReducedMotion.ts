"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server cannot know the visitor's preference. Rendering the
// non-reduced markup keeps the server and first client render identical;
// the real value arrives on hydration.
const getServerSnapshot = () => false;

/**
 * Tracks `prefers-reduced-motion`. Every animated surface reads this and
 * renders its final state immediately when the user has asked for less
 * motion, rather than simply animating faster.
 *
 * Implemented with `useSyncExternalStore` rather than an effect that calls
 * `setState`: matchMedia is an external store, and reading it through the
 * dedicated API avoids the extra render pass an effect would cause.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
