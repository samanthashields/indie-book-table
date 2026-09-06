import { Link } from "@tanstack/react-router";
import { BookOpen, CircleCheck, LifeBuoy } from "lucide-react";

export type PenReference =
  | { kind: "milestone"; bookId: string; milestoneId: string; label: string }
  | { kind: "book"; bookId: string; label: string }
  | { kind: "article"; slug: string; label: string };

const TOKEN = /\[\[ref\|([a-z]+)\|([^|\]]*)\|([^|\]]*)\|([^\]]*)\]\]/g;

/**
 * Splits an assistant reply into the text the author reads and the references
 * Pen leaned on. Tokens still mid-stream are hidden rather than shown raw.
 */
export function parsePenMessage(raw: string): { text: string; references: PenReference[] } {
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

  let text = raw.replace(TOKEN, "");
  // Drop a trailing "References:" heading, plus any half-streamed token.
  text = text.replace(/\[\[ref[^\]]*$/i, "");
  text = text.replace(/\n?\s*(?:\*\*)?references(?:\*\*)?\s*:?\s*$/i, "");
  return { text: text.trimEnd(), references };
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
