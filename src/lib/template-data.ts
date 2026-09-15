import foxCover from "@/assets/fox-lantern-cover.jpg";
import riverCover from "@/assets/river-map-cover.jpg";
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
    id: "longform",
    name: "Longform Author Path",
    category: "Fiction & memoir",
    tagline: "A complete editorial and production journey for prose-led books.",
    cover: riverCover,
    illustrated: false,
    highlights: ["Layered revision loops", "Cover and interior production tracks", "Budget-aware guidance from Pen", "Advance reader programme built in"],
    phases: launchPhases(),
  },
];

const fallbackTemplate = templates[1]!;
export const templateById = (id: string): BookTemplate => templates.find((template) => template.id === id) ?? fallbackTemplate;
