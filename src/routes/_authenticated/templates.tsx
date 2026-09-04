import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Eye } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { useTemplates } from "@/lib/book-db";
import { templateCover } from "@/lib/template-covers";

export const Route = createFileRoute("/_authenticated/templates")({ head: () => ({ meta: [
  { title: "Book Cycle Templates — Book Cycles" }, { name: "description", content: "Start with a genre-aware publishing plan and tailor it to your book." }, { property: "og:title", content: "Book Cycle Templates — Book Cycles" }, { property: "og:description", content: "Start with a genre-aware publishing plan and tailor it to your book." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Templates });

function Templates() {
  const { data: templates = [], isLoading } = useTemplates();
  return (
    <AppShell>
      <PageHeading title="Book Cycle Templates" description="A strong starting path, built for how your kind of book is actually made." />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading templates…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {templates.map((template, index) => (
            <article key={template.id} className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-shadow hover:shadow-md sm:grid-cols-[180px_1fr]">
              <img src={templateCover(template.details.illustrated)} alt={`Cover artwork for the ${template.title}`} width={768} height={1152} className="h-full min-h-64 w-full object-cover" loading={index === 0 ? undefined : "lazy"} />
              <div className={index === 0 ? "bg-amber/8 p-6" : "bg-teal/8 p-6"}>
                <div className="mb-3 flex flex-wrap gap-2"><StatusPill tone={index === 0 ? "warm" : "good"}>{template.genre}</StatusPill><StatusPill>{template.phases.length} phases</StatusPill></div>
                <h2 className="font-serif text-3xl font-normal">{template.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {(template.details.highlights ?? []).map((highlight) => <li key={highlight} className="flex gap-2"><Check className="size-4 shrink-0 text-leaf" />{highlight}</li>)}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="outline" asChild><Link to="/templates/$templateId" params={{ templateId: template.id }}><Eye />Preview</Link></Button>
                  <Button asChild><Link to="/books/new" search={{ path: "template", template: template.id }}>Use this template</Link></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
