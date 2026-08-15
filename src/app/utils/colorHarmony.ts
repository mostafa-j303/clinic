// Derives a full brand palette (secondary + hover states) from a single primary
// color, so any color an admin picks in Settings still produces a coherent theme.
// Calibrated against real, tested pairings already used across this project
// (both the current site's purple and the "Clinical Trust" teal direction):
// hover states are the same hue/saturation lightened (not darkened), and the
// secondary color is a lighter, slightly less saturated tint of the primary hue.

export type Hsl = { h: number; s: number; l: number };

export function hexToHsl(hex: string): Hsl {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type SuggestedPalette = {
  secondary: string;
  hoverPrimary: string;
  hoverSecondary: string;
  accent: string;
};

export function suggestPalette(primaryHex: string): SuggestedPalette {
  const primary = hexToHsl(primaryHex);

  const secondary: Hsl = {
    h: (primary.h - 4 + 360) % 360,
    s: clamp(primary.s - 5, 40, 100),
    // Always lighter than the primary, regardless of how light the primary already is.
    l: clamp(primary.l + 17, primary.l + 8, 95),
  };

  const hoverPrimary: Hsl = {
    h: primary.h,
    s: clamp(primary.s - 10, 20, 100),
    l: clamp(primary.l + 7, primary.l + 2, 95),
  };

  const hoverSecondary: Hsl = {
    h: secondary.h,
    s: clamp(secondary.s - 10, 20, 100),
    l: clamp(secondary.l + 7, secondary.l + 2, 97),
  };

  // Analogous hue shift for a distinct CTA/highlight color that still belongs
  // to the same family (calibrated against the teal-primary/green-accent pairing).
  const accent: Hsl = {
    h: (primary.h - 31 + 360) % 360,
    s: clamp(primary.s + 3, 40, 100),
    l: clamp(primary.l - 6, 15, 60),
  };

  return {
    secondary: hslToHex(secondary),
    hoverPrimary: hslToHex(hoverPrimary),
    hoverSecondary: hslToHex(hoverSecondary),
    accent: hslToHex(accent),
  };
}
