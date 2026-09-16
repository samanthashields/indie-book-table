import foxCover from "@/assets/fox-lantern-cover.jpg";
import riverCover from "@/assets/river-map-cover.jpg";
import saltLinesCover from "@/assets/salt-lines-cover.jpg";
import type { Provision, RequirementType } from "@/lib/book-data";
import { PHASE_DEFS } from "@/lib/phase-timeline";

export type TemplateMilestone = {
  /** Stable within this template/draft's own milestone list — used only to resolve dependsOn at creation time, not a real DB id. */
  localId: string;
  name: string;
  requirement: RequirementType;
  note: string;
  track?: string | undefined;
  provision?: Provision | undefined;
  /** localIds of other milestones in the same phase this one depends on. Advisory only. */
  dependsOn?: string[] | undefined;
};
export type TemplatePhase = {
  id: string;
  name: string;
  mode: "Loop" | "Sprint" | "Launch window";
  summary: string;
  milestones: TemplateMilestone[];
  /** Display-only — never deletes the phase's data or excludes it from the timeline math. */
  hidden?: boolean | undefined;
};

export type BookTemplate = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  cover: string;
  illustrated: boolean;
  highlights: string[];
  phases: TemplatePhase[];
};

const DEFAULT_MILESTONES: Record<string, TemplateMilestone[]> = {
  writing_development: [
    { localId: "m-manuscript", name: "Complete working manuscript", requirement: "attach_a_file", note: "One clean working document you can hand to an editor." },
    { localId: "m-beta-notes", name: "Gather beta reader notes", requirement: "request_a_service", note: "A small group of trusted readers, one focused round." },
  ],
  editing: [
    { localId: "m-dev-edit", name: "Review developmental edit", requirement: "approve_a_deliverable", note: "Approval required before revision starts." },
    { localId: "m-revision", name: "Complete revision pass", requirement: "complete_activity_outside", note: "Your own writing time, tracked here." },
    { localId: "m-copyedit", name: "Commission copyedit", requirement: "request_a_service", note: "Hire when budget allows; otherwise a strong self-edit checklist." },
  ],
  production: [
    { localId: "m-cover", name: "Approve cover direction", requirement: "approve_a_deliverable", note: "Choose the direction before final artwork.", track: "design" },
    { localId: "m-interior", name: "Format print interior", requirement: "request_a_service", note: "Print-ready files for every format you plan to sell.", track: "text" },
  ],
  pre_launch: [
    { localId: "m-metadata", name: "Finalize metadata bundle", requirement: "attach_a_file", note: "Description, categories, keywords, contributors." },
    { localId: "m-arc", name: "Send advance reader copies", requirement: "complete_activity_outside", note: "Give reviewers at least four weeks." },
  ],
  launch: [
    { localId: "m-publish", name: "Publish the book", requirement: "complete_activity_outside", note: "Release all formats and check the live pages." },
  ],
  post_launch_growth: [
    { localId: "m-reflection", name: "Complete post-launch reflection", requirement: "complete_activity_outside", note: "What worked, what changed, what comes next." },
  ],
};

const launchPhases = (extra: Partial<Record<string, TemplateMilestone[]>> = {}): TemplatePhase[] =>
  PHASE_DEFS.map((def) => ({
    id: def.key,
    name: def.name,
    mode: def.mode,
    summary: def.summary,
    milestones: extra[def.key] ?? DEFAULT_MILESTONES[def.key] ?? [],
  }));

/**
 * Fiction Novel's full milestone catalog — from the grill-session gap analysis
 * (docs/Book_Cycles_Gap_Analysis_Grill_Session.md §1), as folded into the Functionality Spec's
 * §5.1. This is the one genre the gap analysis actually walked step by step against a real
 * author's process, so it carries the fullest detail; Memoir and Nonfiction/How-To below are
 * lighter, reasonable defaults, not grilled to the same depth.
 *
 * "Repeats per chapter" milestones (§2-A of the gap analysis) stay a single milestone whose note
 * says so, per the open question left unresolved there — not a schema construct. "Conditional"
 * milestones (§2-B, e.g. the author website) are included unconditionally; an author who already
 * has one removes it in the customize step, same as any other milestone they don't need.
 */
const FICTION_NOVEL_MILESTONES: Record<string, TemplateMilestone[]> = {
  writing_development: [
    { localId: "fn-idea", name: "Capture the idea", requirement: "attach_a_file", note: "Raw notebook dump — backstory and ideas, no structure yet." },
    { localId: "fn-outline", name: "Build a general outline", requirement: "attach_a_file", note: "AI-assisted, before world-building starts.", provision: "hire" },
    { localId: "fn-world", name: "World & rules-building + character development", requirement: "attach_a_file", note: "Nail down mechanics and how characters connect, before drafting starts." },
    { localId: "fn-skeleton", name: "Skeletal first-pass draft", requirement: "attach_a_file", note: "Short chapters capturing the premise and how they connect — not a full draft yet.", dependsOn: ["fn-world"] },
    { localId: "fn-layered-revision", name: "Layered revision passes", requirement: "complete_activity_outside", note: "Extending and deepening each chapter over multiple rounds, chapter by chapter.", dependsOn: ["fn-skeleton"] },
    { localId: "fn-spot-beta", name: "Early spot-check beta read", requirement: "request_a_service", note: "1–2 trusted readers, a couple of chapters only — lighter and earlier than the full beta round." },
    { localId: "fn-deep-revision", name: "Deep revision, chapter by chapter (AI-assisted)", requirement: "complete_activity_outside", note: "AI is a feedback and thinking partner here, never the author of the work — and never a substitute for a professional pass when budget allows. Chapter by chapter.", dependsOn: ["fn-layered-revision"] },
    { localId: "fn-print-markup", name: "Print-and-markup pass", requirement: "complete_activity_outside", note: "Read a physical printout with a red pen — catches what screen-reading misses." },
    { localId: "fn-transcribe", name: "Digital transcription of the markup pass", requirement: "complete_activity_outside", note: "A distinct second step — not the same session as the print-and-markup pass.", dependsOn: ["fn-print-markup"] },
    { localId: "fn-beta-survey", name: "Structured beta-reader survey round", requirement: "request_a_service", note: "A real instrument with specific questions, not just \"send it and hope.\" Ask Pen for a genre-based starter template." },
    { localId: "fn-weigh-feedback", name: "Weigh & incorporate feedback", requirement: "complete_activity_outside", note: "The deliberate judgment call after the survey, distinct from collecting it.", dependsOn: ["fn-beta-survey"] },
    { localId: "fn-full-read", name: "Full manuscript read-through", requirement: "approve_a_deliverable", note: "The gate that decides Writing & Development is actually done.", dependsOn: ["fn-weigh-feedback"] },
    { localId: "fn-front-back-matter", name: "Draft front/back matter content", requirement: "attach_a_file", note: "Acknowledgments, about the author, table of contents, dedication. Writing the content — formatting it happens later in Production." },
    { localId: "fn-blurb", name: "Draft back-cover summary / blurb copy", requirement: "attach_a_file", note: "The back-cover summary or blurb copy." },
    { localId: "fn-tentative-date", name: "Set a tentative/placeholder target pub date", requirement: "complete_activity_outside", note: "Lightweight and early — feeds the schedule without a firm commitment. Firmed up later in Pre-Launch." },
    { localId: "fn-list-building-start", name: "Start lightweight list-building", requirement: "complete_activity_outside", note: "A sign-up page plus casual \"here's what I'm working on\" posts. Starts here, not in Pre-Launch." },
    { localId: "fn-website", name: "Create an author website", requirement: "complete_activity_outside", note: "Skip this one if you already have a site." },
  ],
  editing: [
    { localId: "fn-copyedit", name: "Copyedit pass, AI-assisted, chapter by chapter", requirement: "complete_activity_outside", note: "Grammar, typos, and the rest caught together per chapter, not one full-book pass. Same AI-as-partner framing as the deep revision pass." },
    { localId: "fn-editing-read", name: "Full read-through gate", requirement: "approve_a_deliverable", note: "Confirms readiness for Production.", dependsOn: ["fn-copyedit"] },
    { localId: "fn-lock", name: "Lock manuscript", requirement: "complete_activity_outside", note: "No more structural changes after this.", dependsOn: ["fn-editing-read"] },
  ],
  production: [
    { localId: "fn-interior", name: "Interior formatting", requirement: "request_a_service", note: "Formats to the trim template selected in Setup Tasks — applies an earlier decision, doesn't make one.", track: "text" },
    { localId: "fn-cover", name: "Cover design", requirement: "request_a_service", note: "Runs in parallel with interior formatting. Weigh interior illustration density, not genre alone, when deciding DIY vs. hire.", track: "design" },
    { localId: "fn-kdp-draft", name: "KDP draft creation", requirement: "complete_activity_outside", note: "Triggers KDP's own automated format-check on manuscript and cover files.", track: "publishing" },
    { localId: "fn-ingram-listing", name: "IngramSpark listing + format check", requirement: "complete_activity_outside", note: "Runs in parallel with the KDP draft.", track: "publishing" },
    { localId: "fn-ingram-preorder", name: "IngramSpark preorder scheduling", requirement: "complete_activity_outside", note: "Connecting to the KDP draft isn't instant — build in lead time.", track: "publishing", dependsOn: ["fn-kdp-draft"] },
    { localId: "fn-isbn-decision", name: "ISBN decision: free vs. purchased", requirement: "complete_activity_outside", note: "Free (KDP-assigned) vs. purchased (portable across vendors) — switching later means redoing every file it touches.", track: "publishing" },
    { localId: "fn-isbn-purchase", name: "ISBN purchase & quantity", requirement: "complete_activity_outside", note: "One per print format. KDP ebooks get a free ASIN automatically and don't need one.", track: "publishing", dependsOn: ["fn-isbn-decision"] },
    { localId: "fn-ebook-file", name: "Build the ebook file via KDP's own tool", requirement: "attach_a_file", note: "Distinct from print interior layout, even though both come from the same manuscript.", track: "text" },
    { localId: "fn-pricing", name: "Set final pricing across formats", requirement: "complete_activity_outside", note: "Pricing for every format you're selling.", track: "publishing" },
    { localId: "fn-proofs", name: "Order & physically verify proof copies", requirement: "complete_activity_outside", note: "The human check automated format-checks can't do — print quality, binding, trim feel.", track: "publishing", dependsOn: ["fn-interior", "fn-cover"] },
  ],
  pre_launch: [
    { localId: "fn-firm-date", name: "Firm up the pub date", requirement: "complete_activity_outside", note: "The second commitment — the tentative one was set back in Writing & Development." },
    { localId: "fn-arc-team", name: "Build & activate the ARC team", requirement: "request_a_service", note: "Sequenced first in this phase — the longest lead time. Ask Pen if you've never run one before." },
    { localId: "fn-list-building-continue", name: "Continue list-building", requirement: "complete_activity_outside", note: "Started back in Writing & Development, now at higher intensity." },
    { localId: "fn-content-marketing", name: "Content marketing / blogging begins", requirement: "complete_activity_outside", note: "Starts later than list-building — needs a concrete asset (cover, title reveal, excerpt) to be about." },
    { localId: "fn-preorder-live", name: "Ebook preorder goes live", requirement: "complete_activity_outside", note: "Once metadata and pricing are set." },
    { localId: "fn-early-reviews", name: "Secure early/editorial reviews", requirement: "request_a_service", note: "Distinct from ARC reader reviews." },
    { localId: "fn-final-sprint", name: "Final sprint (last 1–2 weeks)", requirement: "complete_activity_outside", note: "Countdown emails, reminder posts." },
  ],
  launch: [
    { localId: "fn-click-publish", name: "Click publish", requirement: "complete_activity_outside", note: "The action the whole sequence culminates in — launch is a sequence, not just a countdown window." },
    { localId: "fn-verify-live", name: "Verify live and correct on Amazon and IngramSpark", requirement: "approve_a_deliverable", note: "Before announcing anything.", dependsOn: ["fn-click-publish"] },
    { localId: "fn-announce-social", name: "Announce — social media", requirement: "complete_activity_outside", note: "Once the live pages are verified.", dependsOn: ["fn-verify-live"] },
    { localId: "fn-announce-blog", name: "Announce — blog post", requirement: "complete_activity_outside", note: "Once the live pages are verified.", dependsOn: ["fn-verify-live"] },
    { localId: "fn-announce-email", name: "Announce — email list", requirement: "complete_activity_outside", note: "Once the live pages are verified.", dependsOn: ["fn-verify-live"] },
    { localId: "fn-update-website", name: "Update the author website from \"preorder\" to \"available now\"", requirement: "complete_activity_outside", note: "Easy to forget — worth its own reminder specifically on launch day.", dependsOn: ["fn-click-publish"] },
  ],
  post_launch_growth: [
    { localId: "fn-post-launch-marketing", name: "Marketing push with changed messaging", requirement: "complete_activity_outside", note: "Shifts from pre-launch anticipation copy to reader-response, \"it's here\" energy — same channels, different content." },
    { localId: "fn-author-copies", name: "Order author copies", requirement: "complete_activity_outside", note: "Physical stock for signings, gifts, and direct sales — distinct from the proof copies ordered in Production." },
  ],
};

export const templates: BookTemplate[] = [
  {
    id: "picture-book",
    name: "Picture Book Path",
    category: "Children’s picture book",
    tagline: "For illustrated books where words, art, and page turns develop together.",
    cover: foxCover,
    illustrated: true,
    highlights: ["Mandatory illustrator track", "Parallel layout and artwork approvals", "Print-proof colour check", "Longer production window for illustration rounds"],
    phases: launchPhases({
      writing_development: [
        { localId: "m-pb-text", name: "Complete the text and page plan", requirement: "attach_a_file", note: "Word count plus a 32-page spread map." },
        { localId: "m-pb-read-aloud", name: "Read the text aloud with young readers", requirement: "complete_activity_outside", note: "Picture book text is heard before it is read." },
      ],
      production: [
        { localId: "m-pb-illustrator", name: "Commission the illustrator", requirement: "request_a_service", note: "Mandatory for this path; brief, contract, and schedule.", track: "design", provision: "hire" },
        { localId: "m-pb-character-studies", name: "Approve character studies", requirement: "approve_a_deliverable", note: "Lock the look before full spreads begin.", track: "design", dependsOn: ["m-pb-illustrator"] },
        { localId: "m-pb-spreads", name: "Approve final spreads", requirement: "approve_a_deliverable", note: "Runs in parallel with layout.", track: "design", dependsOn: ["m-pb-character-studies"] },
        { localId: "m-pb-proof", name: "Check the printed colour proof", requirement: "complete_activity_outside", note: "Screen colour and press colour are not the same.", track: "publishing", dependsOn: ["m-pb-spreads"] },
      ],
    }),
  },
  {
    id: "fiction-novel",
    name: "Fiction Novel Path",
    category: "Fiction (novel)",
    tagline: "The full editorial and production journey for a fiction manuscript, chapter by chapter.",
    cover: riverCover,
    illustrated: false,
    highlights: ["Idea-to-outline-to-draft staged from scratch", "Layered, chapter-by-chapter revision and copyedit loops", "ISBN and IngramSpark/KDP lead-time flags built in", "Advance reader programme and launch-day sequencing"],
    phases: launchPhases(FICTION_NOVEL_MILESTONES),
  },
  {
    id: "memoir",
    name: "Memoir Path",
    category: "Memoir",
    tagline: "A production journey for true-life stories — with room for the extra care they need.",
    cover: saltLinesCover,
    illustrated: false,
    highlights: ["Layered revision loops", "Permissions and sensitivity read built into editing", "Cover and interior production tracks", "Advance reader programme built in"],
    phases: launchPhases({
      editing: [
        { localId: "mm-dev-edit", name: "Review developmental edit", requirement: "approve_a_deliverable", note: "Approval required before revision starts." },
        { localId: "mm-sensitivity", name: "Sensitivity / permissions read", requirement: "request_a_service", note: "Check quoted conversations, named people, and sensitive material — flag anything that needs a permission or a change before it goes further." },
        { localId: "mm-revision", name: "Complete revision pass", requirement: "complete_activity_outside", note: "Your own writing time, tracked here.", dependsOn: ["mm-sensitivity"] },
        { localId: "mm-copyedit", name: "Commission copyedit", requirement: "request_a_service", note: "Hire when budget allows; otherwise a strong self-edit checklist." },
      ],
    }),
  },
  {
    id: "nonfiction-how-to",
    name: "Nonfiction / How-To Path",
    category: "Nonfiction / how-to",
    tagline: "A production journey built around a clear promise to the reader and the proof you deliver on it.",
    cover: riverCover,
    illustrated: false,
    highlights: ["Reader promise and comps set up front", "Structured for platform-building alongside writing", "Back matter (resources, further reading) tracked separately", "Cover and interior production tracks"],
    phases: launchPhases({
      writing_development: [
        { localId: "nf-promise", name: "Define the reader's promise", requirement: "attach_a_file", note: "The one problem this book solves, in a sentence — everything else gets checked against it." },
        { localId: "nf-comps", name: "Gather comparable titles", requirement: "attach_a_file", note: "A few books that solve a similar problem — useful for positioning and for querying your own gaps." },
        { localId: "nf-manuscript", name: "Complete working manuscript", requirement: "attach_a_file", note: "One clean working document you can hand to an editor." },
        { localId: "nf-back-matter", name: "Draft back matter (resources, further reading)", requirement: "attach_a_file", note: "The appendix, resource list, or further-reading section readers expect from a how-to." },
        { localId: "nf-beta", name: "Gather beta reader notes", requirement: "request_a_service", note: "Ideally from people who match your actual reader, not just fellow writers." },
      ],
      pre_launch: [
        { localId: "nf-metadata", name: "Finalize metadata bundle", requirement: "attach_a_file", note: "Description, categories, and keywords tuned to how your reader actually searches." },
        { localId: "nf-platform", name: "Line up platform / expert placements", requirement: "complete_activity_outside", note: "Podcasts, guest posts, or communities where your reader already spends time." },
        { localId: "nf-arc", name: "Send advance reader copies", requirement: "complete_activity_outside", note: "Give reviewers at least four weeks." },
      ],
    }),
  },
];

export const templateById = (id: string): BookTemplate => templates.find((template) => template.id === id) ?? templates.find((template) => template.id === "fiction-novel")!;
