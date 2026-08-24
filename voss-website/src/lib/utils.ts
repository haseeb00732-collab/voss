import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class lists so a caller's override actually wins.
 *
 * The primitives in `components/ui` ship a full, token-resolved class list.
 * Without `twMerge` a call site passing `px-control-x-l` to a button that
 * already says `px-control-x` emits both and the cascade decides by source
 * order — which is not something a component author can see or control.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
