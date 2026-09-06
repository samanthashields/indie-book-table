type QuickAction = { label: string; prompt: string };

const NEXT: Record<string, string> = {
  overview:
    "Looking at my shelf, my open milestones and their due dates, what is the single next thing I should do? Say why.",
  books: "Across the books on my shelf, what is the single next step I should take, and on which book?",
  cycle:
    "For the book cycle I'm looking at, what should I do next? Use my current phase, my open milestones and their due dates, and tell me if I'm behind.",
  milestone:
    "For the milestone I'm looking at, what should I do next to finish it, and how does its due date look?",
  submissions:
    "Based on my published books and submissions to The Table, what should I do next to get a book in front of readers?",
  create: "Given what I've told you about this new book, what should I decide or do next?",
};

const WHERE: Record<string, string> = {
  overview: "Where in Author's Workshop do I do that? Point me to the exact page and link it.",
  books: "Where in Author's Workshop do I do that for this book? Point me to the exact page and link it.",
  cycle: "Which page of this book cycle do I work in for that? Link me to the milestone or the cycle page.",
  milestone: "Where exactly do I record my work on this milestone? Link me to it.",
  submissions: "Where do I submit or update a book for The Table? Link me to the page.",
  create: "Where do I set this up in Author's Workshop? Link me to the page.",
};

export function penQuickActions(section: string | undefined): QuickAction[] {
  const key = section && NEXT[section] ? section : "overview";
  return [
    { label: "What should I do next?", prompt: NEXT[key]! },
    {
      label: "Show me a help article",
      prompt:
        "Which Help Center article fits what we've been talking about? Recommend one by title and tell me what I'll get from it.",
    },
    { label: "Where do I do this?", prompt: WHERE[key]! },
  ];
}

export function PenQuickActions({
  section,
  disabled,
  onPick,
}: {
  section?: string | undefined;
  disabled?: boolean | undefined;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {penQuickActions(section).map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled ?? false}
          onClick={() => onPick(action.prompt)}
          className="rounded-full border border-teal/45 bg-teal/12 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-teal/25 disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
