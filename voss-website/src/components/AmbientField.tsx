import type { CSSProperties } from "react";

/**
 * The animated background for everything after the range.
 *
 * Above the range the page is lit by the photography — twelve bags on twelve
 * grounds carry all the colour the eye needs. Below it there are no
 * photographs at all, just type on black, and that is where the site was
 * going flat. §1.6 is the fix: the product hues, drifting.
 *
 * These are the SIX BAG COLOURS and nothing else. §1.1 — nothing on this site
 * gets a hue unless a bag has that hue, which is what keeps the palette
 * reading as earned rather than sprinkled on.
 *
 * The orbs are deliberately unequal: different sizes, different periods,
 * different delays, and periods that share no common factor. Four fields on
 * the same 90s loop would visibly pulse together; 74/91/103/117 never
 * re-align inside a session.
 *
 * Inert, aria-hidden, pointer-events: none, and compositor-only.
 */

type Orb = {
  hue: string;
  /** Size as a % of the container's shorter axis. */
  size: number;
  top: string;
  left: string;
  dx: string;
  dy: string;
  dur: string;
  delay: string;
};

const ORBS: Orb[] = [
  { hue: "--color-hue-cognac", size: 62, top: "-8%", left: "-6%", dx: "8%", dy: "6%", dur: "74s", delay: "0s" },
  { hue: "--color-hue-olive", size: 54, top: "28%", left: "62%", dx: "-7%", dy: "-5%", dur: "91s", delay: "-12s" },
  { hue: "--color-hue-wine", size: 48, top: "62%", left: "6%", dx: "6%", dy: "-8%", dur: "103s", delay: "-31s" },
  { hue: "--color-hue-camel", size: 44, top: "78%", left: "58%", dx: "-5%", dy: "4%", dur: "117s", delay: "-47s" },
];

export function AmbientField() {
  return (
    <div aria-hidden="true" className="ambient-field -z-10">
      {ORBS.map((o) => (
        <span
          key={o.hue}
          className="ambient-orb"
          style={
            {
              /* 18% over the ground, the same strength §1.6 gives a veil.
                 The raw hue at full strength would read as a coloured light
                 rather than as the room being warm. */
              "--orb": `color-mix(in srgb, var(${o.hue}) 18%, transparent)`,
              "--orb-dx": o.dx,
              "--orb-dy": o.dy,
              "--orb-dur": o.dur,
              "--orb-delay": o.delay,
              width: `${o.size}vw`,
              height: `${o.size}vw`,
              top: o.top,
              left: o.left,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
