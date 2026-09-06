import foxCover from "@/assets/fox-lantern-cover.jpg";
import riverCover from "@/assets/river-map-cover.jpg";
import type { RequirementType } from "@/lib/book-data";

export type TemplateMilestone = { name: string; requirement: RequirementType; note: string };
export type TemplatePhase = {
  id: string;
  name: string;
  mode: "Loop" | "Sprint" | "Launch window";
  summary: string;
  milestones: TemplateMilestone[];
  /** Optional share of the whole cycle, in percent. Left out, the workshop spaces the phase automatically. */
  ratio?: number | undefined;
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

const launchPhases = (extra: Partial<Record<string, TemplateMilestone[]>> = {}): TemplatePhase[] => [
  {
    id: "writing",
    name: "Writing & Development",
    mode: "Loop",
    summary: "Shape the manuscript, test the premise, and revise with intention.",
    milestones: extra["writing"] ?? [
      { name: "Complete working manuscript", requirement: "Attach a File", note: "One clean working document you can hand to an editor." },
      { name: "Gather beta reader notes", requirement: "Request a Service", note: "A small group of trusted readers, one focused round." },
    ],
  },
  {
    id: "editing",
    name: "Editing",
    mode: "Loop",
    summary: "Move from structural clarity to clean, confident prose.",
    milestones: extra["editing"] ?? [
      { name: "Review developmental edit", requirement: "Approve a Deliverable", note: "Approval required before revision starts." },
      { name: "Complete revision pass", requirement: "Complete an Activity Outside the Platform", note: "Your own writing time, tracked here." },
      { name: "Commission copyedit", requirement: "Request a Service", note: "Hire when budget allows; otherwise a strong self-edit checklist." },
    ],
  },
  {
    id: "production",
    name: "Production",
    mode: "Sprint",
    summary: "Turn the manuscript into a book people can hold and read.",
    milestones: extra["production"] ?? [
      { name: "Approve cover direction", requirement: "Approve a Deliverable", note: "Choose the direction before final artwork." },
      { name: "Format print interior", requirement: "Request a Service", note: "Print-ready files for every format you plan to sell." },
    ],
  },
  {
    id: "prelaunch",
    name: "Pre-Launch",
    mode: "Sprint",
    summary: "Prepare the listing, early readers, and a realistic launch plan.",
    milestones: extra["prelaunch"] ?? [
      { name: "Finalize metadata bundle", requirement: "Attach a File", note: "Description, categories, keywords, contributors." },
      { name: "Send advance reader copies", requirement: "Complete an Activity Outside the Platform", note: "Give reviewers at least four weeks." },
    ],
  },
  {
    id: "launch",
    name: "Launch",
    mode: "Launch window",
    summary: "Publish, verify every storefront, and invite the first wave of readers.",
    milestones: extra["launch"] ?? [
      { name: "Publish the book", requirement: "Complete an Activity Outside the Platform", note: "Release all formats and check the live pages." },
    ],
  },
  {
    id: "growth",
    name: "Post-Launch & Growth",
    mode: "Loop",
    summary: "Learn from the launch and build steady, sustainable readership.",
    milestones: extra["growth"] ?? [
      { name: "Complete post-launch reflection", requirement: "Complete an Activity Outside the Platform", note: "What worked, what changed, what comes next." },
    ],
  },
];

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
      writing: [
        { name: "Complete the text and page plan", requirement: "Attach a File", note: "Word count plus a 32-page spread map." },
        { name: "Read the text aloud with young readers", requirement: "Complete an Activity Outside the Platform", note: "Picture book text is heard before it is read." },
      ],
      production: [
        { name: "Commission the illustrator", requirement: "Request a Service", note: "Mandatory for this path; brief, contract, and schedule." },
        { name: "Approve character studies", requirement: "Approve a Deliverable", note: "Lock the look before full spreads begin." },
        { name: "Approve final spreads", requirement: "Approve a Deliverable", note: "Runs in parallel with layout." },
        { name: "Check the printed colour proof", requirement: "Complete an Activity Outside the Platform", note: "Screen colour and press colour are not the same." },
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
    highlights: ["Layered revision loops", "Cover and interior production tracks", "Budget-aware Book Coach guidance", "Advance reader programme built in"],
    phases: launchPhases(),
  },
];

const fallbackTemplate = templates[1]!;
export const templateById = (id: string): BookTemplate => templates.find((template) => template.id === id) ?? fallbackTemplate;
