import tableHero from "@/assets/table-hero.jpg";
import tableStrip1 from "@/assets/table-strip-1.jpg";
import tableStrip2 from "@/assets/table-strip-2.jpg";
import tableStrip3 from "@/assets/table-strip-3.jpg";
import missionHero from "@/assets/mission-hero.jpg";
import penMarkAsset from "@/assets/pen-mark.png.asset.json";

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
  "mission.headline": "A shared table, not a storefront",
  "mission.body":
    "Every month we set out a new issue of independently published books. For each one, we ask how it was made: who edited it, who drew the cover, and where the help came from. That way readers can choose with open eyes, and the people behind every indie book get the credit they deserve. Awards are welcome here, but they are never the price of a seat.",
  "mission.hero.image": missionHero,
  "mission.principles.title": "What we stand for",
  "mission.principle1.title": "Every book gets the same seat",
  "mission.principle1.body":
    "First book or fifteenth, award winner or not, every title gets the same spotlight and the same honest write-up.",
  "mission.principle2.title": "We show how it was made",
  "mission.principle2.body":
    "Good books are built by teams. We name the editors, designers, and helpers so readers can see the care behind the pages.",
  "mission.principle3.title": "Writers helping writers",
  "mission.principle3.body":
    "We're indie authors too. We read every submission the way we'd want our own books read.",
  "mission.ask.title": "What we ask every book",
  "mission.ask.intro":
    "Before a book joins The Table, we ask a few simple questions. The answers appear alongside the listing.",
  "mission.ask.items": [
    "Edited by | Who shaped the manuscript, from developmental edits to the final proofread.",
    "Cover by | The designer or illustrator who gave the book its face.",
    "Published through | How the book reached readers, from a small press to the author's own imprint.",
    "Help from | Beta readers, critique partners, and anyone else who pulled up a chair.",
  ].join("\n"),
  "mission.mid.image": tableStrip3,
  "mission.cta.title": "Find your next favorite, or bring your own",
  "mission.cta.body": "Browse this month's issue, or start your next book in the Author's Workshop.",
  "mission.cta.primary": "Read this month's issue",
  "mission.cta.secondary": "Explore the Author's Workshop",
  // Retired from the page but kept so stored edits aren't lost.
  "mission.quotes.title": "What we keep saying",

  "workshop.hero.title": "Write it, finish it, launch it",
  "workshop.hero.body":
    "The Author's Workshop guides you through every phase of making a book, from first draft to launch day and beyond. Plan your book, bring in your team, and always know your next step.",
  "workshop.hero.cta": "Create your free account",
  "workshop.hero.signin": "Already have an account? Log in",
  "workshop.hero.image": tableStrip3,
  "workshop.phases.title": "Your book, one phase at a time",
  "workshop.phases.intro":
    "Every book moves through six phases. The Workshop breaks each one into clear milestones so nothing slips through the cracks.",
  "workshop.phases.items": [
    "Writing and development | Shape the story and get the draft finished.",
    "Editing | Developmental edits, copyedits, and proofreading, with feedback loops built in.",
    "Production | Cover, interior, and publishing setup, running side by side.",
    "Pre-launch | Build early buzz with ARC readers, reviews, and your launch plan.",
    "Launch | Release day and the weeks right after it.",
    "Post-launch growth | Keep the book selling, then reflect on what to carry into the next one.",
  ].join("\n"),
  "workshop.features.title": "Everything your book needs, in one place",
  "workshop.feature1.title": "Book Cycles",
  "workshop.feature1.body":
    "Turn your book into a plan with phases, milestones, and a pace that fits your launch date. See what's on track and what needs attention.",
  "workshop.feature2.title": "Genre templates",
  "workshop.feature2.body":
    "Start from a template built for your genre, or start from scratch. Either way, you're never staring at a blank page.",
  "workshop.feature3.title": "Pen, your book coach",
  "workshop.feature3.body":
    "Pen helps you build your plan, explains each step, and flags the expensive mistakes before you make them. Warm, plain advice and one clear next step.",
  "workshop.feature3.image": penMarkAsset.url,
  "workshop.feature4.title": "Your publishing team",
  "workshop.feature4.body":
    "Invite your editor, cover designer, and beta readers to the phases they're working on. Review and approve their work in one place.",
  "workshop.bridge.title": "From the Workshop to The Table",
  "workshop.bridge.body":
    "When your book is ready, submit it to The Table, our monthly issue of independent books. Every submission is read by our editors, and every book gets the same seat.",
  "workshop.bridge.link": "See this month's issue",
  "workshop.plans.title": "Start free, add Pen when you're ready",
  "workshop.plan.free.name": "Free",
  "workshop.plan.free.items": [
    "Unlimited Book Cycles",
    "Genre templates or start from scratch",
    "Invite collaborators",
    "Submit your book to The Table",
  ].join("\n"),
  "workshop.plan.paid.name": "Workshop with Pen",
  "workshop.plan.paid.items": [
    "Everything in Free",
    "Pen builds your plan with you",
    "Step-by-step guidance in every phase",
    "DIY-or-hire advice that fits your budget",
  ].join("\n"),
  "workshop.plans.cta": "Create your free account",
  "workshop.closing.title": "Pull up a chair",
  "workshop.closing.body": "Your next book deserves a plan, a team, and a seat at the table.",
  "workshop.closing.cta": "Join the Author's Workshop",
};

export function siteCopyValue(copy: Record<string, string>, key: string) {
  const value = copy[key];
  return value && value.trim() ? value : (SITE_COPY_DEFAULTS[key] ?? "");
}

/** Non-empty trimmed lines of a "one per line" copy field. */
export function copyLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Parses "Label | description" lines, splitting on the first pipe. */
export function copyPairs(value: string) {
  return copyLines(value).map((line) => {
    const at = line.indexOf("|");
    return at === -1
      ? { label: line, text: "" }
      : { label: line.slice(0, at).trim(), text: line.slice(at + 1).trim() };
  });
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
  { key: "mission.body", label: "Lead paragraph", kind: "long" },
  { key: "mission.hero.image", label: "Hero image", kind: "image" },
  { key: "mission.principles.title", label: "Principles heading", kind: "text" },
  { key: "mission.principle1.title", label: "Principle 1 heading", kind: "text" },
  { key: "mission.principle1.body", label: "Principle 1 sentence", kind: "long" },
  { key: "mission.principle2.title", label: "Principle 2 heading", kind: "text" },
  { key: "mission.principle2.body", label: "Principle 2 sentence", kind: "long" },
  { key: "mission.principle3.title", label: "Principle 3 heading", kind: "text" },
  { key: "mission.principle3.body", label: "Principle 3 sentence", kind: "long" },
  { key: "mission.ask.title", label: "\"What we ask\" heading", kind: "text" },
  { key: "mission.ask.intro", label: "\"What we ask\" intro", kind: "long" },
  { key: "mission.ask.items", label: "\"What we ask\" items (one per line, Label | description)", kind: "long" },
  { key: "mission.mid.image", label: "Image beside \"What we ask\"", kind: "image" },
  { key: "mission.cta.title", label: "Closing heading", kind: "text" },
  { key: "mission.cta.body", label: "Closing sentence", kind: "long" },
  { key: "mission.cta.primary", label: "Reader button words", kind: "text" },
  { key: "mission.cta.secondary", label: "Author button words", kind: "text" },
];

export const WORKSHOP_FIELDS: SiteCopyField[] = [
  { key: "workshop.hero.title", label: "Hero headline", kind: "text" },
  { key: "workshop.hero.body", label: "Hero sub-headline", kind: "long" },
  { key: "workshop.hero.cta", label: "Hero button words", kind: "text" },
  { key: "workshop.hero.signin", label: "Log-in link words", kind: "text" },
  { key: "workshop.hero.image", label: "Hero image", kind: "image" },
  { key: "workshop.phases.title", label: "Phases heading", kind: "text" },
  { key: "workshop.phases.intro", label: "Phases intro", kind: "long" },
  { key: "workshop.phases.items", label: "Phases (one per line, Name | description, six lines)", kind: "long" },
  { key: "workshop.features.title", label: "Features heading", kind: "text" },
  { key: "workshop.feature1.title", label: "Feature 1 heading", kind: "text" },
  { key: "workshop.feature1.body", label: "Feature 1 text", kind: "long" },
  { key: "workshop.feature1.image", label: "Feature 1 image", kind: "image" },
  { key: "workshop.feature2.title", label: "Feature 2 heading", kind: "text" },
  { key: "workshop.feature2.body", label: "Feature 2 text", kind: "long" },
  { key: "workshop.feature2.image", label: "Feature 2 image", kind: "image" },
  { key: "workshop.feature3.title", label: "Feature 3 heading", kind: "text" },
  { key: "workshop.feature3.body", label: "Feature 3 text", kind: "long" },
  { key: "workshop.feature3.image", label: "Feature 3 image", kind: "image" },
  { key: "workshop.feature4.title", label: "Feature 4 heading", kind: "text" },
  { key: "workshop.feature4.body", label: "Feature 4 text", kind: "long" },
  { key: "workshop.feature4.image", label: "Feature 4 image", kind: "image" },
  { key: "workshop.bridge.title", label: "Bridge heading", kind: "text" },
  { key: "workshop.bridge.body", label: "Bridge paragraph", kind: "long" },
  { key: "workshop.bridge.link", label: "Bridge link words", kind: "text" },
  { key: "workshop.plans.title", label: "Plans heading", kind: "text" },
  { key: "workshop.plan.free.name", label: "Free plan name", kind: "text" },
  { key: "workshop.plan.free.price", label: "Free plan price (leave empty to hide)", kind: "text" },
  { key: "workshop.plan.free.items", label: "Free plan items (one per line)", kind: "long" },
  { key: "workshop.plan.paid.name", label: "Paid plan name", kind: "text" },
  { key: "workshop.plan.paid.price", label: "Paid plan price (leave empty to hide)", kind: "text" },
  { key: "workshop.plan.paid.items", label: "Paid plan items (one per line)", kind: "long" },
  { key: "workshop.plans.cta", label: "Plans button words", kind: "text" },
  { key: "workshop.closing.title", label: "Closing heading", kind: "text" },
  { key: "workshop.closing.body", label: "Closing sentence", kind: "long" },
  { key: "workshop.closing.cta", label: "Closing button words", kind: "text" },
];

/** Keys already edited on their own admin page, so the catch-all page can skip them. */
export const OWNED_COPY_KEYS = new Set([
  ...TABLE_HOME_FIELDS.map((field) => field.key),
  ...MISSION_FIELDS.map((field) => field.key),
  ...WORKSHOP_FIELDS.map((field) => field.key),
  // Retired from the mission page; stored values are kept but no longer edited anywhere.
  "mission.taglines",
  "mission.quotes.title",
]);
