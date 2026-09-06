import tableHero from "@/assets/table-hero.jpg";
import tableStrip1 from "@/assets/table-strip-1.jpg";
import tableStrip2 from "@/assets/table-strip-2.jpg";
import tableStrip3 from "@/assets/table-strip-3.jpg";
import missionHero from "@/assets/mission-hero.jpg";

/** Every editable piece of copy on the public site, with the wording that ships by default. */
export const SITE_COPY_DEFAULTS: Record<string, string> = {
  "table.home.hero.title": "Pull up a chair to the indie author table",
  "table.home.hero.subtitle":
    "Independent books, chosen by hand and laid out like a magazine. Meet the authors, read the hooks, find your next favourite.",
  "table.home.hero.cta": "Read this month's issue",
  "table.home.hero.image": tableHero,
  "table.home.strip.image1": tableStrip1,
  "table.home.strip.image2": tableStrip2,
  "table.home.strip.image3": tableStrip3,
  "table.home.welcome.title": "Everyone eats at the same table",
  "table.home.welcome.body":
    "Awards or no awards, first book or fifteenth — every indie title gets the same seat, the same light and the same honest write-up.",
  "table.home.welcome.image": tableStrip1,
  "table.home.submit.title": "Bring a book to the table",
  "table.home.submit.body":
    "Published something you're proud of? Send it in. Our editors read every submission and pick a fresh line-up each month.",
  "table.home.steps.1": "Send us your book — cover, hook, where to buy it.",
  "table.home.steps.2": "Our editors read it and add it to the database.",
  "table.home.steps.3": "Get picked for an issue and meet new readers.",
  "mission.headline": "Our mission",
  "mission.hero.image": missionHero,
  "mission.mid.image": tableStrip3,
  "mission.quotes.title": "What we keep saying",
};

export function siteCopyValue(copy: Record<string, string>, key: string) {
  const value = copy[key];
  return value && value.trim() ? value : (SITE_COPY_DEFAULTS[key] ?? "");
}

export type SiteCopyField = {
  key: string;
  label: string;
  kind: "text" | "long" | "image";
};

export const TABLE_HOME_FIELDS: SiteCopyField[] = [
  { key: "table.home.hero.title", label: "Hero headline", kind: "text" },
  { key: "table.home.hero.subtitle", label: "Hero sub-headline", kind: "long" },
  { key: "table.home.hero.cta", label: "Hero button words", kind: "text" },
  { key: "table.home.hero.image", label: "Hero image", kind: "image" },
  { key: "table.home.strip.image1", label: "Picture strip — first image", kind: "image" },
  { key: "table.home.strip.image2", label: "Picture strip — second image", kind: "image" },
  { key: "table.home.strip.image3", label: "Picture strip — third image", kind: "image" },
  { key: "table.home.welcome.title", label: "Welcome heading", kind: "text" },
  { key: "table.home.welcome.body", label: "Welcome paragraph", kind: "long" },
  { key: "table.home.welcome.image", label: "Welcome image", kind: "image" },
  { key: "table.home.submit.title", label: "Invitation heading", kind: "text" },
  { key: "table.home.submit.body", label: "Invitation paragraph", kind: "long" },
  { key: "table.home.steps.1", label: "How it works — step one", kind: "text" },
  { key: "table.home.steps.2", label: "How it works — step two", kind: "text" },
  { key: "table.home.steps.3", label: "How it works — step three", kind: "text" },
];

export const MISSION_FIELDS: SiteCopyField[] = [
  { key: "mission.headline", label: "Page headline", kind: "text" },
  { key: "mission.hero.image", label: "Hero image", kind: "image" },
  { key: "mission.body", label: "The story", kind: "long" },
  { key: "mission.mid.image", label: "Image between story and quotes", kind: "image" },
  { key: "mission.quotes.title", label: "Quote block heading", kind: "text" },
  { key: "mission.taglines", label: "Quotes (one per line)", kind: "long" },
];

/** Keys already edited on their own admin page, so the catch-all page can skip them. */
export const OWNED_COPY_KEYS = new Set([
  ...TABLE_HOME_FIELDS.map((field) => field.key),
  ...MISSION_FIELDS.map((field) => field.key),
]);
