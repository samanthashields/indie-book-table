import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Eye, Plus, SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { ViewSwitcher, useCollectionView } from "@/components/view-switcher";
import { useCurrentUser } from "@/lib/use-current-user";
import { useDeleteAuthorTemplate, useSaveAuthorTemplate, useTemplates } from "@/lib/book-db";
import { templateCover } from "@/lib/template-covers";

export const Route = createFileRoute("/_authenticated/templates/")({ head: () => ({ meta: [
  { title: "Book Cycle Templates — The Indie Book Table" }, { name: "description", content: "Start with a genre-aware publishing plan, or build and save your own." }, { property: "og:title", content: "Book Cycle Templates — The Indie Book Table" }, { property: "og:description", content: "Start with a genre-aware publishing plan, or build and save your own." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Templates });

function Templates() {
  const { data: templates = [], isLoading } = useTemplates();
  const user = useCurrentUser();
  const save = useSaveAuthorTemplate();
  const remove = useDeleteAuthorTemplate();
  const navigate = useNavigate();
  const [view, setView] = useCollectionView("grid");
  const userId = user.data?.id;

  const globals = templates.filter((template) => template.published && !template.archived);
  const mine = templates.filter((template) => template.owner_id === userId && !template.published);

  const clone = (template: (typeof templates)[number]) => {
    save.mutate(
      {
        input: {
          title: `${template.title} (my copy)`,
          description: template.description ?? "",
          genre: template.genre ?? "",
          audience: template.audience ?? "",
          duration: template.duration ?? "",
          phases: template.phases,
          details: template.details,
        },
      },
      {
        onSuccess: (id) => { toast.success("Copied to your templates"); void navigate({ to: "/templates/mine/$templateId", params: { templateId: id } }); },
        onError: () => toast.error("Couldn’t copy that template"),
      },
    );
  };

  const destroy = (id: string) => {
    if (!window.confirm("Delete this template? Book cycles already created from it stay as they are.")) return;
    remove.mutate(id, { onSuccess: () => toast.success("Template deleted"), onError: () => toast.error("Couldn’t delete that template") });
  };

  return (
    <AppShell>
      <PageHeading
        title="Book Cycle Templates"
        description="A strong starting path, built for how your kind of book is actually made — plus the ones you save yourself."
        action={<div className="flex flex-wrap items-center gap-3"><ViewSwitcher view={view} onChange={setView} label="Choose how templates are shown" /><Button asChild><Link to="/templates/mine/$templateId" params={{ templateId: "new" }}><Plus />New template</Link></Button></div>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading templates…</p>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="mb-5 font-heading text-2xl font-semibold">Genre templates</h2>
            <div className={view === "grid" ? "grid gap-6 lg:grid-cols-2" : "space-y-4"}>
              {globals.map((template, index) => (
                <article key={template.id} className={`grid overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-shadow hover:shadow-md ${view === "list" ? "sm:grid-cols-[110px_1fr]" : "sm:grid-cols-[140px_1fr]"}`}>
                  <img src={templateCover(template.details.illustrated)} alt={`Cover artwork for the ${template.title}`} width={768} height={1152} className={`w-full object-cover ${view === "list" ? "h-32 sm:h-full sm:min-h-40" : "h-40 sm:h-full sm:min-h-48"}`} loading={index === 0 ? undefined : "lazy"} />
                  <div className={`bg-card p-6 ${view === "list" ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-10" : ""}`}>
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2"><StatusPill tone={index === 0 ? "warm" : "good"}>{template.genre}</StatusPill><StatusPill>{template.phases.length} phases</StatusPill></div>
                      <h3 className="font-heading text-3xl font-normal">{template.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex flex-col">
                      <ul className="mt-5 space-y-2 text-sm lg:mt-0">
                        {(template.details.highlights ?? []).map((highlight) => <li key={highlight} className="flex gap-2"><Check className="size-4 shrink-0 text-text-leaf" />{highlight}</li>)}
                      </ul>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button variant="outline" asChild><Link to="/templates/$templateId" params={{ templateId: template.id }}><Eye />Preview</Link></Button>
                        <Button variant="outline" disabled={save.isPending} onClick={() => clone(template)}><Copy />Make my own copy</Button>
                        <Button asChild><Link to="/books/new" search={{ path: "template", template: template.id }}>Use this template</Link></Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-baseline justify-between"><h2 className="font-heading text-2xl font-semibold">My templates</h2><span className="text-sm text-muted-foreground">{mine.length} saved</span></div>
            {mine.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-paper p-8 text-center">
                <p className="text-sm leading-6 text-muted-foreground">You haven’t saved a template yet. Copy a genre template and change it, or build one from an empty set of phases.</p>
                <Button className="mt-5" asChild><Link to="/templates/mine/$templateId" params={{ templateId: "new" }}><Plus />New template</Link></Button>
              </div>
            ) : (
              <div className={view === "grid" ? "grid gap-4 lg:grid-cols-2" : "space-y-4"}>
                {mine.map((template) => (
                  <article key={template.id} className={`rounded-2xl border border-border bg-card p-6 shadow-xs ${view === "list" ? "sm:flex sm:items-center sm:justify-between sm:gap-8" : ""}`}>
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">{template.genre && <StatusPill tone="warm">{template.genre}</StatusPill>}<StatusPill>{template.phases.length} phases</StatusPill></div>
                      <h3 className="font-heading text-2xl font-normal">{template.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
                    </div>
                    <div className={`flex flex-wrap gap-3 ${view === "list" ? "mt-5 sm:mt-0 sm:shrink-0" : "mt-5"}`}>
                      <Button variant="outline" asChild><Link to="/templates/mine/$templateId" params={{ templateId: template.id }}><SquarePen />Edit</Link></Button>
                      <Button asChild><Link to="/books/new" search={{ path: "template", template: template.id }}>Use this template</Link></Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${template.title}`} onClick={() => destroy(template.id)}><Trash2 /></Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
