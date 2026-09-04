import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { phaseStyle } from "@/lib/phase-style";
import { templateById } from "@/lib/template-data";

export const Route = createFileRoute("/_authenticated/templates/$templateId")({
  head: () => ({ meta: [
    { title: "Template Preview — Book Cycles" },
    { name: "description", content: "Preview every phase, milestone, and requirement in this book cycle template before you use it." },
    { property: "og:title", content: "Template Preview — Book Cycles" },
    { property: "og:description", content: "Preview every phase, milestone, and requirement in this book cycle template before you use it." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TemplatePreview,
});

function TemplatePreview() {
  const { templateId } = Route.useParams();
  const template = templateById(templateId);
  return (
    <AppShell>
      <nav className="mb-6"><Link to="/templates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />All templates</Link></nav>
      <header className="mb-9 grid gap-6 rounded-2xl border border-border bg-paper p-6 md:grid-cols-[140px_minmax(0,1fr)_auto] md:items-center">
        <img src={template.cover} alt={`Cover artwork for the ${template.name}`} width={768} height={1152} className="aspect-[2/3] w-28 rounded-lg object-cover shadow-sm" />
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2"><StatusPill tone="warm">{template.category}</StatusPill><StatusPill>{template.phases.length} phases</StatusPill>{template.illustrated && <StatusPill tone="good">Illustrator track</StatusPill>}</div>
          <h1 className="font-serif text-4xl font-normal md:text-5xl">{template.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{template.tagline}</p>
        </div>
        <Button asChild><Link to="/books/new" search={{ path: "template", template: template.id }}>Use this template</Link></Button>
      </header>

      <section className="mb-9 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="font-serif text-2xl font-normal">What makes this path different</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {template.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check className="size-4 shrink-0 text-leaf" />{highlight}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="mb-5 font-serif text-3xl font-normal">Every phase in this template</h2>
        <div className="space-y-4">
          {template.phases.map((phase, index) => {
            const style = phaseStyle(phase.id);
            return (
              <article key={phase.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
                <span className={`grid size-10 place-items-center rounded-full border-2 font-semibold ${style.marker}`}>{index + 1}</span>
                <div className={`rounded-2xl border border-border p-5 ${style.soft}`}>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-normal">{phase.name}</h3><StatusPill>{phase.mode}</StatusPill></div>
                  <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {phase.milestones.map((milestone) => (
                      <li key={milestone.name} className="rounded-xl bg-card p-4 shadow-xs">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-semibold">{milestone.name}</p>
                          <p className="text-xs text-muted-foreground">{milestone.requirement}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{milestone.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
