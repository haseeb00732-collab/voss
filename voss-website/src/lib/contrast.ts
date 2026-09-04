/**
 * WCAG relative luminance and contrast, measured from what the browser
 * actually computed rather than from the hex we hoped it resolved to.
 *
 * This matters because half the §1.6 palette is `color-mix()`, which never
 * appears as a hex anywhere — the only way to know what a veil really is, is
 * to ask the browser. getComputedStyle returns two different shapes: plain
 * values come back `rgb(11, 10, 9)`, color-mix results come back
 * `color(srgb 0.04 0.043 0.046)`. Both are parsed here.
 */

export type Rgb = { r: number; g: number; b: number };

/** Parse a computed colour string into 0–255 channels. */
export function parseComputed(value: string): Rgb | null {
  const srgb = value.match(
    /color\(srgb\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/,
  );
  if (srgb) {
    return {
      r: Number(srgb[1]) * 255,
      g: Number(srgb[2]) * 255,
      b: Number(srgb[3]) * 255,
    };
  }
  const rgb = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }
  return null;
}

const channel = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

/** WCAG 2.x relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, order-independent. */
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Resolve a CSS custom property to real channels by letting the browser
 * paint it. Reading the property directly gives back the literal
 * `color-mix(...)` text on some engines; assigning it to a real property and
 * reading THAT forces resolution.
 */
export function resolveToken(token: string, scope: Element): Rgb | null {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  probe.style.display = "none";
  scope.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  return parseComputed(computed);
}
