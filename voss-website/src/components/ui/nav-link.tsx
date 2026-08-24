"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A link whose underline sweeps in from the left rather than fading. It is
 * the same gesture as every other hairline on the site, at link scale —
 * which is why it scales on the x axis instead of animating opacity.
 *
 * The sweep is a child span, not a `border-bottom` transition, so the rule
 * has an origin. `--dur-1` and `--ease-lux`, like every other hover here.
 */
export function NavLink({
  href,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(
        "eyebrow group relative block py-2 text-[var(--text-secondary)]",
        "transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)]",
        "hover:text-[var(--link)]",
        className,
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[var(--text-tertiary)] transition-transform duration-[var(--dur-1)] ease-[var(--ease-lux)] group-hover:scale-x-100"
      />
    </Link>
  );
}
