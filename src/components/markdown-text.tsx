import type { ReactNode } from "react";

/** Inline formatting: **bold**, *italic*, [text](url), `code`. */
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyBase}-${index++}`;
    if (token.startsWith("**")) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`")) nodes.push(<code key={key} className="rounded bg-secondary px-1 py-0.5 text-[0.9em]">{token.slice(1, -1)}</code>);
    else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(<a key={key} href={href} className="underline hover:text-link">{label}</a>);
    } else nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Renders the small markdown subset the journal editor writes. */
export function MarkdownText({ body, className }: { body: string; className?: string }) {
  const blocks = body.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;
        const trimmed = block.trim();

        const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(trimmed);
        if (image) {
          return (
            <figure key={key} className="my-6">
              <img src={image[2]} alt={image[1] ?? ""} className="w-full rounded-2xl object-cover" loading="lazy" />
              {image[1] && <figcaption className="mt-2 text-sm text-muted-foreground">{image[1]}</figcaption>}
            </figure>
          );
        }

        if (trimmed.startsWith("### ")) return <h3 key={key} className="mt-8 font-heading text-2xl">{inline(trimmed.slice(4), key)}</h3>;
        if (trimmed.startsWith("## ")) return <h2 key={key} className="mt-8 font-heading text-3xl">{inline(trimmed.slice(3), key)}</h2>;
        if (trimmed.startsWith("# ")) return <h2 key={key} className="mt-8 font-heading text-4xl">{inline(trimmed.slice(2), key)}</h2>;
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={key} className="my-6 border-l-4 border-primary/40 pl-4 font-heading text-xl italic text-foreground/80">
              {inline(trimmed.replace(/^> ?/gm, ""), key)}
            </blockquote>
          );
        }

        const lines = trimmed.split("\n");
        if (lines.every((line) => /^[-*] /.test(line))) {
          return (
            <ul key={key} className="my-5 list-disc space-y-1 pl-6">
              {lines.map((line, i) => <li key={`${key}-${i}`}>{inline(line.slice(2), `${key}-${i}`)}</li>)}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\. /.test(line))) {
          return (
            <ol key={key} className="my-5 list-decimal space-y-1 pl-6">
              {lines.map((line, i) => <li key={`${key}-${i}`}>{inline(line.replace(/^\d+\. /, ""), `${key}-${i}`)}</li>)}
            </ol>
          );
        }

        return <p key={key} className="my-5">{inline(trimmed, key)}</p>;
      })}
    </div>
  );
}
