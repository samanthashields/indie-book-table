/**
 * Per-issue flyer theming for the flip-book reader: seasonal presets, border
 * motifs and per-page grounds. Presentation only — every value here is a
 * class name built from the app's design tokens (amber/leaf/teal/inkblue/
 * clay/cocoa/paper), not a raw hex.
 */
export type BorderPattern = "hearts" | "stars" | "dots" | "pencils" | "plain";

export type ThemePreset =
  | "default"
  | "halloween"
  | "winter"
  | "spring"
  | "valentine"
  | "school";

export type FlyerColor =
  | "lime"
  | "red"
  | "yellow"
  | "sky"
  | "pink"
  | "purple"
  | "orange"
  | "teal";

/** Neutral press stock used for page grounds. Color lives in the accents. */
export type PaperTone = "newsprint" | "manila" | "cool" | "blush";

export type FlyerIssueTheme = {
  preset: ThemePreset;
  border_pattern: BorderPattern;
  cover_image_url: string | null;
  cover_headline: string | null;
  cover_tagline: string | null;
};

export type FlyerPageTheme = {
  category: string;
  ground_color: string | null;
  background_image_url: string | null;
};

export const DEFAULT_ISSUE_THEME: FlyerIssueTheme = {
  preset: "default",
  border_pattern: "hearts",
  cover_image_url: null,
  cover_headline: null,
  cover_tagline: null,
};

const PRESETS: Record<
  ThemePreset,
  {
    pattern: BorderPattern;
    rotation: FlyerColor[] | null;
    cover: FlyerColor;
    groundRotation: PaperTone[];
    coverGround: PaperTone;
  }
> = {
  default: {
    pattern: "hearts",
    rotation: null,
    cover: "yellow",
    groundRotation: ["newsprint", "manila"],
    coverGround: "newsprint",
  },
  halloween: {
    pattern: "stars",
    rotation: ["orange", "purple", "yellow"],
    cover: "orange",
    groundRotation: ["manila", "newsprint"],
    coverGround: "manila",
  },
  winter: {
    pattern: "dots",
    rotation: ["sky", "red", "teal"],
    cover: "sky",
    groundRotation: ["cool", "newsprint"],
    coverGround: "cool",
  },
  spring: {
    pattern: "dots",
    rotation: ["lime", "pink", "yellow"],
    cover: "lime",
    groundRotation: ["newsprint", "cool"],
    coverGround: "newsprint",
  },
  valentine: {
    pattern: "hearts",
    rotation: ["pink", "red", "purple"],
    cover: "pink",
    groundRotation: ["blush", "newsprint"],
    coverGround: "blush",
  },
  school: {
    pattern: "pencils",
    rotation: ["yellow", "sky", "red"],
    cover: "yellow",
    groundRotation: ["manila", "cool"],
    coverGround: "manila",
  },
};

const GROUND: Record<PaperTone, string> = {
  newsprint: "bg-background",
  manila: "bg-paper",
  cool: "bg-secondary",
  blush: "bg-amber/15",
};

const PANEL: Record<FlyerColor, string> = {
  lime: "bg-leaf text-cocoa",
  red: "bg-clay text-card",
  yellow: "bg-amber text-cocoa",
  sky: "bg-teal text-cocoa",
  pink: "bg-clay/60 text-cocoa",
  purple: "bg-inkblue text-card",
  orange: "bg-clay/80 text-cocoa",
  teal: "bg-teal/70 text-cocoa",
};

const ACCENT_BAR: Record<FlyerColor, string> = {
  lime: "bg-leaf",
  red: "bg-clay",
  yellow: "bg-amber",
  sky: "bg-teal",
  pink: "bg-clay/60",
  purple: "bg-inkblue",
  orange: "bg-clay/80",
  teal: "bg-teal",
};

const PATTERN: Record<BorderPattern, string> = {
  hearts: "fly-hearts",
  stars: "fly-stars",
  dots: "fly-dots",
  pencils: "fly-pencils",
  plain: "fly-plain",
};

export function groundClass(tone: PaperTone): string {
  return GROUND[tone];
}

export function panelClass(color: FlyerColor): string {
  return PANEL[color];
}

export function accentBarClass(color: FlyerColor): string {
  return ACCENT_BAR[color];
}

export function patternClass(pattern: BorderPattern): string {
  return PATTERN[pattern] ?? PATTERN.hearts;
}

export function isPaperTone(value: string | null): value is PaperTone {
  return !!value && value in GROUND;
}

/** Stored ground may be a legacy candy color; map it to the nearest stock. */
const LEGACY_TONE: Record<FlyerColor, PaperTone> = {
  lime: "newsprint",
  red: "blush",
  yellow: "manila",
  sky: "cool",
  pink: "blush",
  purple: "cool",
  orange: "manila",
  teal: "cool",
};

export function toPaperTone(value: string | null): PaperTone | null {
  if (isPaperTone(value)) return value;
  if (value && value in LEGACY_TONE) return LEGACY_TONE[value as FlyerColor];
  return null;
}

/** Deterministic ribbon panel per category label. */
const RIBBON_ROTATION: FlyerColor[] = ["lime", "red", "yellow", "sky", "teal", "purple", "orange", "pink"];

const NAMED_RIBBON: Record<string, FlyerColor> = {
  adult: "purple",
  "new adult": "pink",
  "young adult": "sky",
  "middle grade": "teal",
  "picture book": "orange",
  "picture books": "orange",
  fiction: "purple",
  nonfiction: "lime",
  "young readers": "yellow",
  poetry: "pink",
};

export function categoryRibbonColor(category: string): FlyerColor {
  const key = category.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const named = NAMED_RIBBON[key];
  if (named) return named;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  return RIBBON_ROTATION[hash % RIBBON_ROTATION.length]!;
}

/** Resolved look for one flyer page, merging preset, page override and images. */
export type ResolvedPage = {
  ground: string;
  accent: FlyerColor;
  backgroundImage: string | null;
  pattern: BorderPattern;
};

export function resolvePage(
  theme: FlyerIssueTheme,
  pages: FlyerPageTheme[],
  category: string | null,
  pageIndex: number,
): ResolvedPage {
  const preset = PRESETS[theme.preset] ?? PRESETS.default;
  const override = category ? pages.find((page) => page.category === category) : undefined;

  const overrideTone = toPaperTone(override?.ground_color ?? null);
  const tone: PaperTone =
    overrideTone ??
    (category === null
      ? preset.coverGround
      : (preset.groundRotation[pageIndex % preset.groundRotation.length] ?? preset.coverGround));

  const accent: FlyerColor =
    category === null || !preset.rotation
      ? preset.cover
      : (preset.rotation[pageIndex % preset.rotation.length] ?? preset.cover);

  return {
    ground: groundClass(tone),
    accent,
    backgroundImage: override?.background_image_url ?? null,
    pattern: theme.border_pattern ?? preset.pattern,
  };
}
