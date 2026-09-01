"use client";

import { useEffect, useState } from "react";
import {
  ALL_PALETTE_TOKENS,
  SEMANTIC,
  SUBSTRATES,
  type TokenGroup,
} from "@/lib/tokens";
import { contrast, parseComputed, resolveToken, type Rgb } from "@/lib/contrast";

export type GuardResult = {
  missing: string[];
  checked: number;
  ratios: Record<string, number>;
};

/**
 * Reads every token in the manifest out of the live document and fails loudly
 * on any that resolved to nothing. An empty token is the failure mode Tailwind
 * v4 will not tell you about: `var(--color-x)` renders as no colour at all and
 * nothing in the build, the console or the type system objects.
 *
 * The result is also parked on `window.__vossTokenGuard` so a headless check
 * can read it without scraping the DOM.
 */
function runGuard(): GuardResult {
  const root = document.documentElement;
  const rootStyle = getComputedStyle(root);
  const missing: string[] = [];
  let checked = 0;

  for (const token of ALL_PALETTE_TOKENS) {
    checked += 1;
    if (rootStyle.getPropertyValue(token).trim() === "") missing.push(token);
  }

  // The semantic layer only exists inside a substrate, so probe one of each.
  for (const surface of SUBSTRATES) {
    const probe = document.createElement("div");
    probe.setAttribute("data-surface", surface);
    probe.style.display = "none";
    document.body.appendChild(probe);
    const style = getComputedStyle(probe);
    for (const token of SEMANTIC) {
      checked += 1;
      if (style.getPropertyValue(token).trim() === "") {
        missing.push(`[${surface}] ${token}`);
      }
    }
    probe.remove();
  }

  // The numbers §1.3 and §1.5 assert, measured rather than trusted.
  const ratios: Record<string, number> = {};
  const pairs: [string, string, string][] = [
    ["chalk on ink-950", "--color-chalk", "--color-ink-950"],
    ["smoke on ink-950", "--color-smoke", "--color-ink-950"],
    ["pewter on ink-950", "--color-pewter", "--color-ink-950"],
    ["gold-500 on ink-950", "--color-gold-500", "--color-ink-950"],
    ["gold-900 on paper-50", "--color-gold-900", "--color-paper-50"],
    ["verm-500 on ink-950", "--color-verm-500", "--color-ink-950"],
    ["verm-800 on paper-50", "--color-verm-800", "--color-paper-50"],
    ["ink-on-paper on paper-50", "--color-ink-on-paper", "--color-paper-50"],
  ];
  for (const [label, fg, bg] of pairs) {
    const f = resolveToken(fg, root);
    const b = resolveToken(bg, root);
    if (f && b) ratios[label] = Math.round(contrast(f, b) * 100) / 100;
  }

  const result = { missing, checked, ratios };
  (window as unknown as Record<string, unknown>).__vossTokenGuard = result;
  return result;
}

export function TokenGuard({ groups }: { groups: readonly TokenGroup[] }) {
  const [result, setResult] = useState<GuardResult | null>(null);
  useEffect(() => setResult(runGuard()), []);

  const failed = result !== null && result.missing.length > 0;

  return (
    <>
      <div
        data-guard={result === null ? "pending" : failed ? "fail" : "pass"}
        className="mb-band rounded-sm border p-group"
        style={{
          borderColor: failed ? "var(--color-verm-500)" : "var(--border-strong)",
          background: failed
            ? "color-mix(in srgb, var(--color-verm-500) 12%, transparent)"
            : "transparent",
        }}
      >
        <p className="eyebrow" style={{ color: "var(--text-accent)" }}>
          Token emission guard
        </p>
        <p className="body-l mt-tight">
          {result === null
            ? "Running…"
            : failed
              ? `FAIL — ${result.missing.length} of ${result.checked} tokens resolved to nothing.`
              : `Pass — all ${result.checked} tokens resolved.`}
        </p>
        {failed && (
          <ul className="mt-item font-mono text-sm">
            {result.missing.map((t) => (
              <li key={t} style={{ color: "var(--color-verm-400)" }}>
                {t}
              </li>
            ))}
          </ul>
        )}
        {result !== null && Object.keys(result.ratios).length > 0 && (
          <table className="mt-item w-full text-left font-mono text-sm">
            <tbody>
              {Object.entries(result.ratios).map(([label, ratio]) => (
                <tr key={label}>
                  <td className="py-tight pr-group">{label}</td>
                  <td
                    style={{
                      color:
                        ratio >= 4.5
                          ? "var(--text-accent)"
                          : "var(--color-verm-400)",
                    }}
                  >
                    {ratio.toFixed(2)}:1 {ratio >= 4.5 ? "AA" : "FAILS AA"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Swatches groups={groups} />
    </>
  );
}

function Swatches({ groups }: { groups: readonly TokenGroup[] }) {
  return (
    <div className="flex flex-col gap-band">
      {groups.map((group) => (
        <section key={`${group.section}-${group.title}`}>
          <h2 className="display-3">{group.title}</h2>
          <p className="eyebrow mt-tight" style={{ color: "var(--text-accent)" }}>
            {group.section}
          </p>
          {group.note && (
            <p className="body measure mt-item" style={{ color: "var(--text-secondary)" }}>
              {group.note}
            </p>
          )}
          <div className="mt-group grid grid-cols-2 gap-gap-col sm:grid-cols-3 lg:grid-cols-4">
            {group.tokens.map((token) => (
              <Swatch key={token} token={token} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Swatch({ token }: { token: string }) {
  const [value, setValue] = useState<string>("");
  const [rgb, setRgb] = useState<Rgb | null>(null);

  useEffect(() => {
    const el = document.createElement("span");
    el.style.color = `var(${token})`;
    el.style.display = "none";
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    el.remove();
    setValue(computed);
    setRgb(parseComputed(computed));
  }, [token]);

  const empty = rgb === null;

  return (
    <figure className="flex flex-col gap-tight">
      <div
        className="h-20 w-full rounded-xs border"
        style={{
          background: `var(${token})`,
          borderColor: "var(--border-neutral)",
          // A missing token paints nothing, which looks identical to a dark
          // swatch on a dark page. The stripe makes the hole visible.
          backgroundImage: empty
            ? "repeating-linear-gradient(45deg, var(--color-verm-500) 0 6px, transparent 6px 12px)"
            : undefined,
        }}
      />
      <figcaption className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="block" style={{ color: "var(--text-primary)" }}>
          {token.replace("--color-", "")}
        </span>
        {empty ? "EMPTY — not emitted" : value}
      </figcaption>
    </figure>
  );
}
