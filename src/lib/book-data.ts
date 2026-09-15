import saltLinesCover from "@/assets/salt-lines-cover.jpg";
import riverMapCover from "@/assets/river-map-cover.jpg";
import foxLanternCover from "@/assets/fox-lantern-cover.jpg";

export type RequirementType =
  | "request_a_service"
  | "attach_a_file"
  | "complete_activity_outside"
  | "approve_a_deliverable";

export const REQUIREMENT_TYPES: RequirementType[] = [
  "request_a_service",
  "attach_a_file",
  "complete_activity_outside",
  "approve_a_deliverable",
];

export const requirementLabel: Record<RequirementType, string> = {
  request_a_service: "Request a Service",
  attach_a_file: "Attach a File",
  complete_activity_outside: "Complete an Activity Outside the Platform",
  approve_a_deliverable: "Approve a Deliverable",
};

export type OwnerKind = "author" | "collaborator" | "unassigned";

export const OWNER_KINDS: OwnerKind[] = ["author", "collaborator", "unassigned"];

export const ownerKindLabel: Record<OwnerKind, string> = {
  author: "Author",
  collaborator: "Collaborator",
  unassigned: "Unassigned",
};

export type Provision = "diy" | "hire" | "n/a";

export const PROVISIONS: Provision[] = ["diy", "hire", "n/a"];

export const provisionLabel: Record<Provision, string> = {
  diy: "Do it yourself",
  hire: "Hire out",
  "n/a": "Not applicable",
};

export type Milestone = {
  id: string;
  name: string;
  description: string;
  /** Legacy free-text display fallback — derived from ownerKind/ownerCollaboratorId on write, not edited directly. */
  owner: string;
  ownerKind: OwnerKind;
  ownerCollaboratorId: string | null;
  requirement: RequirementType;
  status: "Complete" | "In progress" | "Not started" | "Blocked" | "On hold";
  /** Which parallel track this milestone belongs to (e.g. "text"/"design"/"publishing" in Production). Free text; most phases have none. */
  track: string | null;
  provision: Provision | null;
  /** Advisory only — real milestone ids within the same book. A stale reference (deleted milestone) is simply not shown, never an error. */
  dependsOn: string[];
  due?: string;
  dueIso?: string;
  approval?: boolean;
};

export type Phase = {
  id: string;
  name: string;
  mode: "Loop" | "Sprint" | "Launch window";
  summary: string;
  milestones: Milestone[];
};

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  status: string;
  progress: number;
  nextAction: string;
  target: string;
  cover: string;
  tone: "cool" | "green" | "warm";
};

const fallbackBook: Book = {
  id: "salt-lines",
  title: "The Salt Lines",
  subtitle: "A novel",
  author: "Mara Ellison",
  genre: "Literary fiction",
  status: "Editing",
  progress: 42,
  nextAction: "Review developmental edit",
  target: "18 September 2026",
  cover: saltLinesCover,
  tone: "green",
};

export const books: Book[] = [
  {
    id: "salt-lines",
    title: "The Salt Lines",
    subtitle: "A novel",
    author: "Mara Ellison",
    genre: "Literary fiction",
    status: "Editing",
    progress: 42,
    nextAction: "Review developmental edit",
    target: "18 September 2026",
    cover: saltLinesCover,
    tone: "green",
  },
  {
    id: "river-map",
    title: "A Map of Rivers",
    subtitle: "Finding home along the watershed",
    author: "Mara Ellison",
    genre: "Memoir",
    status: "Writing & Development",
    progress: 18,
    nextAction: "Finish chapter outline",
    target: "12 February 2027",
    cover: riverMapCover,
    tone: "cool",
  },
  {
    id: "fox-lantern",
    title: "Fox and the Lantern",
    author: "Mara Ellison",
    genre: "Children’s picture book",
    status: "Production",
    progress: 67,
    nextAction: "Approve final character studies",
    target: "3 November 2026",
    cover: foxLanternCover,
    tone: "warm",
  },
];

export const phases: Phase[] = [
  {
    id: "writing_development",
    name: "Writing & Development",
    mode: "Loop",
    summary: "Shape the manuscript, test the premise, and revise with intention.",
    milestones: [
      { id: "manuscript", name: "Complete working manuscript", description: "Bring the full draft into one clean working document.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "attach_a_file", status: "Complete", due: "14 Mar" },
      { id: "beta-notes", name: "Gather beta reader notes", description: "Invite focused feedback from a small group of trusted readers.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "request_a_service", status: "Complete", due: "2 Apr" },
    ],
  },
  {
    id: "editing",
    name: "Editing",
    mode: "Loop",
    summary: "Move from structural clarity to clean, confident prose.",
    milestones: [
      { id: "developmental-edit", name: "Review developmental edit", description: "Read the editor’s letter, resolve the big story questions, and agree on the revision plan.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "approve_a_deliverable", status: "In progress", due: "24 Jun", approval: true },
      { id: "revision-pass", name: "Complete revision pass", description: "Apply the agreed structural changes across the manuscript.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "complete_activity_outside", status: "Not started", due: "26 Jul" },
      { id: "copyedit", name: "Commission copyedit", description: "Send the revised manuscript for a final language and consistency edit.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "request_a_service", status: "Not started" },
    ],
  },
  {
    id: "production",
    name: "Production",
    mode: "Sprint",
    summary: "Turn the manuscript into a book people can hold and read.",
    milestones: [
      { id: "cover", name: "Approve cover direction", description: "Choose the visual direction before final cover production.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "approve_a_deliverable", status: "Not started", approval: true },
      { id: "interior", name: "Format print interior", description: "Prepare print-ready interior files for each format.", owner: "Jon Bell · Formatter", ownerKind: "collaborator", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "request_a_service", status: "Not started" },
    ],
  },
  {
    id: "pre_launch",
    name: "Pre-Launch",
    mode: "Sprint",
    summary: "Prepare the listing, early readers, and a realistic launch plan.",
    milestones: [
      { id: "metadata", name: "Finalize metadata bundle", description: "Lock the description, categories, keywords, and contributor data.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "attach_a_file", status: "Not started" },
      { id: "arc", name: "Send advance reader copies", description: "Distribute advance copies to confirmed readers.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "complete_activity_outside", status: "Not started" },
    ],
  },
  {
    id: "launch",
    name: "Launch",
    mode: "Launch window",
    summary: "Publish, verify every storefront, and invite the first wave of readers.",
    milestones: [
      { id: "publish", name: "Publish the book", description: "Release all planned formats and verify the live product pages.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "complete_activity_outside", status: "Not started", due: "18 Sep" },
    ],
  },
  {
    id: "post_launch_growth",
    name: "Post-Launch & Growth",
    mode: "Loop",
    summary: "Learn from the launch and build steady, sustainable readership.",
    milestones: [
      { id: "reflection", name: "Complete post-launch reflection", description: "Record what worked, what changed, and what comes next.", owner: "Mara Ellison", ownerKind: "author", ownerCollaboratorId: null, track: null, provision: null, dependsOn: [], requirement: "complete_activity_outside", status: "Not started" },
    ],
  },
];

export const bookById = (id: string): Book => books.find((book) => book.id === id) ?? fallbackBook;
const fallbackMilestone: Milestone & { phase: string } = {
  id: "developmental-edit",
  name: "Review developmental edit",
  description: "Read the editor’s letter, resolve the big story questions, and agree on the revision plan.",
  owner: "Mara Ellison",
  ownerKind: "author",
  ownerCollaboratorId: null,
  track: null,
  provision: null,
  dependsOn: [],
  requirement: "approve_a_deliverable",
  status: "In progress",
  due: "24 Jun",
  approval: true,
  phase: "Editing",
};

export const milestoneById = (id: string) => phases.flatMap((phase) => phase.milestones.map((milestone) => ({ ...milestone, phase: phase.name }))).find((milestone) => milestone.id === id) ?? fallbackMilestone;
