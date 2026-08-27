"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MEDIA } from "@/lib/media";
import { PRODUCTS } from "@/lib/products";
import { Hairline, RevealCopy, RevealLines } from "./Reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SPEC_LABELS = ["Leather", "Dimensions", "Production"];

/**
 * A 3:2 frame is 1.5× as wide as it is tall, so a 31° edge in real space is a
 * 0.9 slope in percentage space. Both polygons keep that 90-point offset
 * between their two moving vertices.
 */
const WIPE_HIDDEN = "polygon(0% 190%, 100% 100%, 100% 100%, 0% 100%)";
const WIPE_SHOWN = "polygon(0% 0%, 100% -90%, 100% 100%, 0% 100%)";

/**
 * The Object — where the plan had a rotating 3D bag.
 *
 * A full-bleed macro crop does the one thing the 3D was there for: it makes
 * the product own a space you enter rather than an object you inspect. It
 * also does it at 380kB instead of a WebGL context, holds up under reduced
 * motion, and cannot look like a demo.
 *
 * The image is pinned so the reader is inside the frame for a beat, and it
 * arrives on a clip wipe along the V's own angle rather than a fade — the
 * one diagonal this system allows.
 */
export function TheObject() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const macro = MEDIA.object.macro;
  const piece = PRODUCTS[1];
  const specs = piece.specs.filter((s) => SPEC_LABELS.includes(s.label));

  useGSAP(
    () => {
      if (reduced || !root.current) return;

      // The wipe travels along the V's angle. `inset()` cannot express a
      // diagonal, so the polygon carries it: both moving vertices travel the
      // same 190% distance, which is what holds the edge at a constant slope
      // for the whole reveal instead of letting it swing round.
      gsap.from("[data-object-frame]", {
        clipPath: WIPE_HIDDEN,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-object-frame]", start: "top 85%", once: true },
      });

      gsap.to("[data-object-image]", {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-object-frame]",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section
      id="object"
      ref={root}
      data-surface="dark"
      className="substrate grain overflow-hidden py-section"
      aria-label="The object"
    >
      <div className="above-material relative mx-auto grid max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter">
        <div className="col-span-12 md:col-span-6">
          <Hairline className="mt-5 max-w-[6rem]" />
          <RevealLines as="h2" className="display-l mt-group text-[var(--text-primary)]">
            {piece.name}
          </RevealLines>
        </div>

        <dl className="col-span-12 mt-band self-end md:col-span-3 md:col-start-10 md:mt-0">
          {specs.map((s, i) => (
            <div key={s.label} className="pt-item">
              <Hairline delay={i * 0.09} />
              <dt className="eyebrow mt-item text-[var(--text-accent)]">{s.label}</dt>
              <dd className="caption mt-tight pb-group text-[var(--text-secondary)]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Edge to edge. The gutter does not apply to the object. */}
      <div
        data-object-frame
        className="relative mt-band aspect-[3/2] w-full overflow-hidden bg-paper-200 will-change-[clip-path]"
        style={{ clipPath: WIPE_SHOWN }}
      >
        <div data-object-image className="absolute inset-0 will-change-transform">
          <Image
            src={macro.src}
            alt={macro.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
        </div>
      </div>

      <div className="above-material relative mx-auto mt-group grid max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter">
        <RevealCopy as="p" className="caption col-span-12 text-[var(--text-secondary)] md:col-span-4">
          {piece.description}
        </RevealCopy>
      </div>
    </section>
  );
}
