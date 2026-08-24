"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { VMark } from "./VMark";
import { Button, buttonVariants } from "./ui/button";
import { NavLink } from "./ui/nav-link";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINKS = [{ href: "/collection", label: "Collection" }];

/**
 * Mark left, links right, nothing centred.
 *
 * The scrolled state is a change of *material* — the bar acquires a surface
 * and a hairline — not a change of colour or a shadow. It is driven by a
 * ScrollTrigger rather than a scroll listener so it shares the one rAF loop
 * everything else on the page is already using.
 */
export function Nav() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        start: "top top-=12%",
        onEnter: () => setScrolled(true),
        onLeaveBack: () => setScrolled(false),
      });
      return () => st.kill();
    },
    { scope: root }
  );

  // The overlay owns the viewport while it is open: scroll is locked, Escape
  // closes, and focus returns to the control that opened it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    // Captured now, not read in the cleanup: by the time the cleanup runs the
    // ref may already point somewhere else, and focus would go nowhere.
    const opener = trigger.current;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        ref={root}
        data-surface="dark"
        className={[
          "fixed inset-x-0 top-0 z-50 transition-[height,background-color,backdrop-filter] duration-[var(--dur-2)] ease-[var(--ease-lux)]",
          scrolled
            ? "h-[4.25rem] bg-ink-800/92 backdrop-blur-[12px]"
            : "h-[5.5rem] bg-transparent backdrop-blur-none",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-x-0 bottom-0 h-px bg-[var(--border-hairline)] transition-opacity duration-[var(--dur-2)]",
            scrolled ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <nav
          aria-label="Primary"
          className="mx-auto flex h-full max-w-[120rem] items-center justify-between px-gutter"
        >
          <Link
            href="/#top"
            className="group flex items-center gap-3 focus-visible:outline-offset-8"
            aria-label="VOSS — home"
          >
            <VMark
              className={`w-auto transition-[height] duration-[var(--dur-2)] ease-[var(--ease-lux)] ${
                scrolled ? "h-[18px]" : "h-[21px]"
              }`}
              stroke={11}
            />
            <span className="wordmark text-[0.8125rem] text-paper-100">Voss</span>
          </Link>

          <ul className="hidden items-center gap-group md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <NavLink {...l} />
              </li>
            ))}
            <li>
              <Link href="/#waitlist" className={buttonVariants()}>
                Join the list
              </Link>
            </li>
          </ul>

          <Button
            ref={trigger}
            variant="quiet"
            size="none"
            onClick={() => setOpen(true)}
            className="md:hidden"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            Menu
          </Button>
          </nav>
      </header>

      {/* Outside the <header> on purpose. The scrolled nav carries
          `backdrop-filter`, and any element with a backdrop-filter becomes the
          containing block for its `position: fixed` descendants — which pinned
          this overlay inside a 68px-tall bar and let the whole page show
          through underneath it. */}
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          data-surface="dark"
          className="substrate fixed inset-0 z-50 flex flex-col justify-between px-gutter py-8 md:hidden"
        >
          <div className="flex items-center justify-between">
            <span className="wordmark text-[0.8125rem] text-paper-100">Voss</span>
            <Button variant="quiet" size="none" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>

          <ul className="flex flex-col gap-group">
            {[...LINKS, { href: "/#waitlist", label: "Join the list" }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="display-s block text-paper-100 transition-colors duration-[var(--dur-1)] hover:text-gold-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="caption text-pewter">Made to order</p>
        </div>
      )}
    </>
  );
}
