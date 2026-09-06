import { Link } from "@tanstack/react-router";
import { BookOpen, CircleCheck, LifeBuoy } from "lucide-react";

export type PenReference =
  | { kind: "milestone"; bookId: string; milestoneId: string; label: string }
  | { kind: "book"; bookId: string; label: string }
  | { kind: "article"; slug: string; label: string };

const TOKEN = /\[\[ref\|([a-z]+)\|([^|\]]*)\|([^|\]]*)\|([^\]]*)\]\]/g;
const ASK = /\[\[ask\|([^\]]*)\]\]/g;
const STEP_LINE = /^\s*(?:[-*\u2022]|\d+[.)])\s+(.*\S)\s*$/;

/**
 * Splits an assistant reply into the text the author reads, the references Pen
 * leaned on, the follow-up questions it offered, and any numbered next steps
 * that can become a milestone checklist. Tokens still mid-stream are hidden
 * rather than shown raw.
 */
export function parsePenMessage(raw: string): {
  text: string;
  references: PenReference[];
  followUps: string[];
  steps: string[];
} {
  const references: PenReference[] = [];

  for (const match of raw.matchAll(TOKEN)) {
    const [, kind, first = "", second = "", rawLabel = ""] = match;
    const label = rawLabel.trim();
    if (!label) continue;
    if (kind === "milestone" && first && second) {
      references.push({ kind, bookId: first, milestoneId: second, label });
    } else if (kind === "book" && first) {
      references.push({ kind, bookId: first, label });
    } else if (kind === "article" && first) {
      references.push({ kind, slug: first, label });
    }
  }

  const followUps: string[] = [];
  for (const match of raw.matchAll(ASK)) {
    const question = (match[1] ?? "").trim();
    if (question) followUps.push(question);
  }

  let text = raw.replace(TOKEN, "").replace(ASK, "");
  // Drop trailing "References:" / "Follow-ups:" headings, plus any half-streamed token.
  text = text.replace(/\[\[(?:ref|ask)[^\]]*$/i, "");
  text = text.replace(/\n?\s*(?:\*\*)?(?:references|follow-?ups)(?:\*\*)?\s*:?\s*$/i, "");
  text = text.replace(/\n?\s*(?:\*\*)?(?:references|follow-?ups)(?:\*\*)?\s*:?\s*$/i, "");
  text = text.trimEnd();

  const steps = text
    .split("\n")
    .map((line) => STEP_LINE.exec(line)?.[1]?.replace(/\*\*/g, "").trim() ?? "")
    .filter((line) => line.length > 2);

  return { text, references, followUps: followUps.slice(0, 3), steps };
}

export function PenReferenceChips({ references }: { references: PenReference[] }) {
  if (references.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {references.map((reference, index) => {
        const className =
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 text-xs font-semibold transition-colors hover:bg-amber/25";

        if (reference.kind === "milestone") {
          return (
            <Link
              key={`${reference.milestoneId}-${index}`}
              to="/books/$bookId/milestones/$milestoneId"
              params={{ bookId: reference.bookId, milestoneId: reference.milestoneId }}
              className={className}
            >
              <CircleCheck className="size-3.5 text-muted-foreground" />
              {reference.label}
            </Link>
          );
        }

        if (reference.kind === "book") {
          return (
            <Link
              key={`${reference.bookId}-${index}`}
              to="/books/$bookId"
              params={{ bookId: reference.bookId }}
              className={className}
            >
              <BookOpen className="size-3.5 text-muted-foreground" />
              {reference.label}
            </Link>
          );
        }

        return (
          <Link
            key={`${reference.slug}-${index}`}
            to="/help/articles/$slug"
            params={{ slug: reference.slug }}
            className={className}
          >
            <LifeBuoy className="size-3.5 text-muted-foreground" />
            {reference.label}
          </Link>
        );
      })}
    </div>
  );
}
