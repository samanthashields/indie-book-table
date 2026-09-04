export type Answers = Record<string, string>;

export type Question = {
  id: string;
  prompt: (a: Answers) => string;
  chips?: string[];
  multi?: boolean;
  input?: "text" | "textarea" | "date" | "number";
  placeholder?: string;
  reflect: (value: string, a: Answers) => string;
  essential?: boolean;
  retry?: string;
};

export const bookName = (a: Answers) => {
  const raw = (a["title"] ?? "").trim();
  if (!raw || /^not sure/i.test(raw)) return "your book";
  return raw;
};

const list = (value: string) => value.split(", ").filter(Boolean);

export const monthsNeeded = (a: Answers) => {
  const status = a["status"] ?? "";
  let months = /still drafting/i.test(status) ? 12 : /first draft/i.test(status) ? 8 : 5;
  if (/picture book/i.test(a["genre"] ?? "")) months += 6;
  return months;
};

export const monthsUntil = (date: string) => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
};

export const honestDate = (a: Answers) => {
  const target = new Date();
  target.setMonth(target.getMonth() + monthsNeeded(a));
  return target.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const questions: Record<string, Question> = {
  fork: {
    id: "fork",
    prompt: () => "Do you want to start from one of our book templates for your genre, or build your plan from scratch with me?",
    chips: ["Start from a template", "Build from scratch"],
    reflect: (v) =>
      v === "Start from a template"
        ? "Good call — a template saves you a lot of setup."
        : "Let's build it together, then. I'll keep it to a few honest questions.",
  },
  genre: {
    id: "genre",
    essential: true,
    prompt: () => "What kind of book are you publishing?",
    chips: ["Fiction (novel)", "Nonfiction / how-to", "Memoir", "Children's picture book", "Other"],
    placeholder: "Or describe it in your own words",
    retry: "Even a rough idea helps — what genre feels closest?",
    reflect: (v) =>
      /picture book/i.test(v)
        ? "A picture book — I'll build in the illustration track from the start."
        : `Great — ${v.toLowerCase()}. I'll tailor the plan for that.`,
  },
  title: {
    id: "title",
    essential: true,
    prompt: () => "What's the working title? If you don't have one yet, that's fine — say so and I'll suggest one.",
    chips: ["Not sure yet"],
    input: "text",
    placeholder: "Working title",
    reflect: (v) =>
      /^not sure/i.test(v)
        ? "No problem — I'll suggest a working title in the draft, and you can change it any time."
        : `Got it — we'll build the plan for ${v}.`,
  },
  premise: {
    id: "premise",
    essential: true,
    prompt: (a) => `What's ${bookName(a)} about, in a sentence or two?`,
    input: "textarea",
    placeholder: "A sentence or two is plenty",
    retry: "Even one line helps me shape the plan — what's the heart of it?",
    reflect: () => "Thanks — that gives me a feel for the book.",
  },
  formats: {
    id: "formats",
    essential: true,
    multi: true,
    prompt: (a) => `How do you want to publish ${bookName(a)}?`,
    chips: ["Ebook", "Print", "Audiobook"],
    reflect: (v) => `${list(v).join(" and ")} — noted.`,
  },
  path: {
    id: "path",
    essential: true,
    prompt: () => "And which route are you taking?",
    chips: ["Self-publishing", "Hybrid", "Small press"],
    reflect: (v) => `${v} it is. That shapes a few of the production milestones.`,
  },
  audience: {
    id: "audience",
    essential: true,
    prompt: (a) => `Who is ${bookName(a)} for?`,
    chips: [
      "Board books (0–3)",
      "Picture books (3–8)",
      "Early readers (5–8)",
      "Chapter books (6–10)",
      "Middle grade (8–12)",
      "Young adult (12–18)",
      "Adult (18+)",
    ],
    placeholder: "Or describe your reader",
    reflect: (v) => `Writing for ${v.toLowerCase()} — that shapes a few decisions.`,
  },
  status: {
    id: "status",
    essential: true,
    prompt: () => "Where are you with the manuscript?",
    chips: ["Still drafting", "First draft done", "Already edited", "Not started yet"],
    reflect: (v) =>
      /not started/i.test(v)
        ? "Then we'll start the cycle in Writing & Development and build from there."
        : `${v} — I'll start the cycle at the phase that matches.`,
  },
  launchDate: {
    id: "launchDate",
    essential: true,
    input: "date",
    prompt: (a) => `When would you like ${bookName(a)} to launch? I'll work the schedule backward from there.`,
    reflect: (v, a) => {
      const months = monthsUntil(v);
      const needed = monthsNeeded(a);
      if (months !== null && months < needed) {
        return `That's tight for this book starting from "${(a["status"] ?? "here").toLowerCase()}". I can plan an honest date around ${honestDate(a)}, or keep yours and flag what we'd have to cut. Tell me which and I'll set it.`;
      }
      return "Launching around then — I'll set the milestone due dates working backward.";
    },
  },
  budget: {
    id: "budget",
    essential: true,
    input: "number",
    prompt: (a) => `What's your budget for producing and launching ${bookName(a)}? A rough number is fine — I'll use it to recommend what to do yourself and what to hire out.`,
    chips: ["No budget yet"],
    placeholder: "3500",
    reflect: (v) =>
      Number(v) > 0
        ? "Got it — I'll spend it where it matters most and keep the rest do-it-yourself."
        : "That's a real way to publish. I'll build a credible do-it-yourself plan and be honest about the tradeoffs.",
  },
  collaborators: {
    id: "collaborators",
    multi: true,
    prompt: (a) => `Who's helping you with ${bookName(a)}? I'll assign them to the right milestones. Leave it blank to run solo — you can add people any time.`,
    chips: [
      "Co-author",
      "Developmental editor",
      "Copyeditor",
      "Proofreader",
      "Cover designer",
      "Formatter",
      "Illustrator",
      "Marketing help",
      "Beta / ARC readers",
    ],
    reflect: (v) =>
      list(v).length
        ? `Added ${list(v).length} collaborator${list(v).length === 1 ? "" : "s"} — I'll route their milestones to them.`
        : "Solo for now — I'll plan it that way and you can add people later.",
  },
  hires: {
    id: "hires",
    multi: true,
    prompt: () => "For the big jobs, which should I plan as hires? Anything you leave off, I'll plan as do-it-yourself.",
    chips: ["Developmental editing", "Copyediting", "Proofreading", "Cover design", "Interior formatting", "Illustration", "Marketing"],
    reflect: (v) =>
      list(v).length ? `I'll plan ${list(v).join(", ").toLowerCase()} as hires and the rest as do-it-yourself.` : "All do-it-yourself, then. I'll point you at good low-cost tools.",
  },
  manuscript: {
    id: "manuscript",
    prompt: () => "Have a draft? Link it and I'll attach it to your Writing & Development milestone.",
    chips: ["Not yet"],
    input: "text",
    placeholder: "Paste a link to your draft",
    reflect: (v) => (/^not yet/i.test(v) ? "No problem — you can link it from the milestone later." : "Linked — your draft is attached to the writing milestone."),
  },
  goal: {
    id: "goal",
    input: "textarea",
    prompt: (a) => `Why are you writing ${bookName(a)} — what would make this a success for you?`,
    chips: ["Sell a set number of copies", "Build authority", "Hit a list", "Tell my story"],
    reflect: (v) => `Noted — this cycle is aimed at ${v.toLowerCase()}.`,
  },
  resources: {
    id: "resources",
    input: "text",
    prompt: () => "Any comparable titles or reference materials you want on hand? I'll keep them with the cycle.",
    chips: ["Not now"],
    placeholder: "Comparable titles, links, notes",
    reflect: (v) => (/^not now/i.test(v) ? "Fine — we can gather comps during pre-launch." : "Saved with your resources."),
  },
  publishing: {
    id: "publishing",
    input: "text",
    prompt: () => "Do you already have an ISBN, an imprint name, or is this part of a series? Optional now — most of this is finalized in production.",
    chips: ["Skip for now"],
    placeholder: "ISBN, imprint, series",
    reflect: (v) => (/^skip/i.test(v) ? "We'll handle it in production." : "Noted for your book details."),
  },
  reflections: {
    id: "reflections",
    prompt: () => "I'll add post-launch reflection prompts for you to answer after launch — use my suggestions, or write your own?",
    chips: ["Use suggested", "Customize"],
    reflect: (v) => (/customize/i.test(v) ? "You can edit them in the draft below." : "I'll include the standard three."),
  },
  template: {
    id: "template",
    essential: true,
    prompt: () => "Choose a template that fits your book — I'll bring in its whole plan for us to review.",
    chips: ["Fiction novel", "Nonfiction / how-to", "Memoir", "Children's picture book"],
    reflect: (v) => `Starting from the ${v} template — it sets up six phases, their milestones, resources, and reflection prompts. You can tailor any of it with me before we create the cycle.`,
  },
  tailor: {
    id: "tailor",
    input: "text",
    prompt: () => "Want to adjust anything — add or drop a milestone, change a hire to do-it-yourself — or use it as-is?",
    chips: ["Use as-is"],
    placeholder: "e.g. drop the audiobook milestones",
    reflect: (v) =>
      /use as-is/i.test(v)
        ? "Using it as-is. Everything stays editable in the draft."
        : `Applied to this cycle's copy: ${v}. The template itself is unchanged.`,
  },
};

export const scratchEssentials = ["genre", "title", "premise", "formats", "path", "audience", "status", "launchDate", "budget"];
export const templateEssentials = ["template", "title", "formats", "launchDate", "budget", "tailor"];

export const enrichment: { id: string; label: string }[] = [
  { id: "collaborators", label: "Add collaborators" },
  { id: "hires", label: "Do it yourself or hire" },
  { id: "manuscript", label: "Link your manuscript" },
  { id: "goal", label: "Add a goal" },
  { id: "resources", label: "Add resources" },
  { id: "publishing", label: "Publishing details" },
  { id: "reflections", label: "Reflection prompts" },
];

export const gatePrompt = (a: Answers) =>
  `I have enough to draft your plan for ${bookName(a)}. Want me to generate a preview now, or shape it a bit more first?`;

export const summaryLine = (a: Answers) => {
  const formats = list(a["formats"] ?? "").join(" and ").toLowerCase() || "ebook";
  const hires = list(a["hires"] ?? "").length;
  return `Here's what I've got: a ${(a["genre"] ?? "book").toLowerCase()} ${formats} book, ${bookName(a)}, published via ${(a["path"] ?? "self-publishing").toLowerCase()} for ${(a["audience"] ?? "adult readers").toLowerCase()}, launching around ${a["launchDate"] || "your target date"}. I'll build the plan across the six phases${hires ? `, with ${hires} job${hires === 1 ? "" : "s"} planned as hires given your budget` : ", mostly do-it-yourself given your budget"}. Drafting it now.`;
};

export const toPayload = (a: Answers) => ({
  premise: `${bookName(a)} — ${a["premise"] || a["genre"] || "a book"}`,
  genre: a["genre"] || a["template"] || "Fiction",
  stage: [a["status"], a["formats"] && `formats: ${a["formats"]}`, a["path"] && `path: ${a["path"]}`, a["audience"] && `audience: ${a["audience"]}`]
    .filter(Boolean)
    .join("; "),
  goals: [
    a["goal"] && `Goal: ${a["goal"]}`,
    a["collaborators"] && `Collaborators available: ${a["collaborators"]}`,
    a["hires"] && `Plan as hires: ${a["hires"]}`,
    a["manuscript"] && `Draft manuscript: ${a["manuscript"]}`,
    a["resources"] && `Comparable titles: ${a["resources"]}`,
    a["publishing"] && `Publishing details: ${a["publishing"]}`,
    a["tailor"] && `Author tailoring: ${a["tailor"]}`,
    a["template"] && `Template: ${a["template"]}`,
  ]
    .filter(Boolean)
    .join("; "),
  targetDate: a["launchDate"] || "",
  budget: Number(a["budget"]) || 0,
});
