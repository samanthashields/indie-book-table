import { useState } from "react";
import { CalendarDays, Check, Download, FileText, Link2, MessageSquare, Paperclip, Pencil, UserRound } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Milestone, RequirementType } from "@/lib/book-data";

const requirementTypes: RequirementType[] = [
  "Request a Service",
  "Attach a File",
  "Complete an Activity Outside the Platform",
  "Approve a Deliverable",
];

const statuses: Milestone["status"][] = ["Not started", "In progress", "Blocked", "On hold", "Complete"];

export function RequirementAction({ type }: { type: RequirementType }) {
  const [done, setDone] = useState(false);
  const copy = {
    "Approve a Deliverable": { title: "Editor’s letter and revision map", body: "Sofia Chen shared 2 files for your approval.", action: "Approve deliverable", icon: Check },
    "Attach a File": { title: "Add the finished file or a share link", body: "PDF, DOCX, EPUB, or a link to your working document.", action: "Choose file", icon: Paperclip },
    "Request a Service": { title: "Invite a specialist to this milestone", body: "They’ll only see this book cycle and the work assigned to them.", action: "Send request", icon: UserRound },
    "Complete an Activity Outside the Platform": { title: "Finish this work in your usual tools", body: "Mark it complete here when the outside work is done.", action: "Mark complete", icon: Check },
  }[type];
  const Icon = copy.icon;
  return (
    <div className="rounded-2xl border border-teal/40 bg-teal/10 p-5">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-xs"><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{copy.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
          {type === "Approve a Deliverable" && (
            <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-card p-3">
              <FileText className="size-5" />
              <div className="min-w-0"><p className="truncate text-sm font-medium">The Salt Lines — developmental letter.pdf</p><p className="text-xs text-muted-foreground">1.8 MB, shared 18 June</p></div>
              <Button variant="ghost" size="icon" aria-label="Download deliverable"><Download /></Button>
            </div>
          )}
          <Button className="mt-4" variant={done ? "secondary" : "default"} onClick={() => setDone(true)}>{done && <Check />}{done ? "Completed" : copy.action}</Button>
        </div>
      </div>
    </div>
  );
}

export function MilestoneBody({ milestone: initial, phaseName, compact = false }: { milestone: Milestone; phaseName: string; compact?: boolean }) {
  const [milestone, setMilestone] = useState<Milestone>(initial);
  const [editing, setEditing] = useState(false);
  const update = (patch: Partial<Milestone>) => setMilestone((current) => ({ ...current, ...patch }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2"><StatusPill>{phaseName}</StatusPill><StatusPill tone={milestone.status === "Complete" ? "good" : milestone.status === "Blocked" ? "danger" : "warm"}>{milestone.status}</StatusPill></div>
          <h2 className={compact ? "font-serif text-3xl font-normal" : "font-serif text-4xl font-normal md:text-5xl"}>{milestone.name}</h2>
        </div>
        <Button variant={editing ? "secondary" : "outline"} onClick={() => setEditing((value) => !value)}><Pencil />{editing ? "Cancel edit" : "Edit milestone"}</Button>
      </div>

      {editing ? (
        <form
          className="space-y-5 rounded-2xl border border-border bg-paper p-5"
          onSubmit={(event) => { event.preventDefault(); setEditing(false); }}
        >
          <label className="block text-sm font-semibold">Milestone name<Input className="mt-2" value={milestone.name} onChange={(event) => update({ name: event.target.value })} /></label>
          <label className="block text-sm font-semibold">Description<Textarea className="mt-2 min-h-24" value={milestone.description} onChange={(event) => update({ description: event.target.value })} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Owner<Input className="mt-2" value={milestone.owner} onChange={(event) => update({ owner: event.target.value })} /></label>
            <label className="block text-sm font-semibold">Due date<Input className="mt-2" value={milestone.due ?? ""} placeholder="e.g. 24 Jun" onChange={(event) => update({ due: event.target.value })} /></label>
            <label className="block text-sm font-semibold">Requirement
              <select className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" value={milestone.requirement} onChange={(event) => update({ requirement: event.target.value as RequirementType })}>
                {requirementTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Status
              <select className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" value={milestone.status} onChange={(event) => update({ status: event.target.value as Milestone["status"] })}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="size-4 accent-[var(--teal)]" checked={Boolean(milestone.approval)} onChange={(event) => update({ approval: event.target.checked })} />Approval required</label>
          <div className="flex gap-3"><Button type="submit">Save milestone</Button><Button type="button" variant="outline" onClick={() => { setMilestone(initial); setEditing(false); }}>Discard changes</Button></div>
        </form>
      ) : (
        <>
          <section>
            <h3 className="font-serif text-2xl font-semibold">About this milestone</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{milestone.description}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-inkblue/8 p-3"><UserRound className="mb-2 size-4 text-inkblue" /><p className="text-xs text-muted-foreground">Owner</p><p className="text-sm font-semibold">{milestone.owner}</p></div>
              <div className="rounded-xl bg-amber/15 p-3"><CalendarDays className="mb-2 size-4 text-amber" /><p className="text-xs text-muted-foreground">Due date</p><p className="text-sm font-semibold">{milestone.due ?? "Not set"}</p></div>
              <div className="rounded-xl bg-leaf/15 p-3"><Check className="mb-2 size-4 text-leaf" /><p className="text-xs text-muted-foreground">Approval</p><p className="text-sm font-semibold">{milestone.approval ? "Required" : "Not required"}</p></div>
            </div>
          </section>
          <section>
            <h3 className="mb-3 font-serif text-2xl font-semibold">Requirement</h3>
            <RequirementAction type={milestone.requirement} />
          </section>
          <section>
            <h3 className="font-serif text-2xl font-semibold">Notes and attachments</h3>
            <Textarea className="mt-3 min-h-28" placeholder="Add a note for yourself or your collaborator" />
            <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline"><Paperclip />Attach file</Button><Button variant="outline"><Link2 />Add link</Button><Button>Save note</Button></div>
          </section>
          <section className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="font-serif text-xl font-normal">Collaborator view</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Sofia sees the description, files, due date, and notes for this milestone — not your full book cycle.</p>
              <div className="mt-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-amber font-semibold text-cocoa">SC</span><div><p className="text-sm font-semibold">Sofia Chen</p><p className="text-xs text-muted-foreground">Developmental editor</p></div></div>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-5">
              <div className="flex items-center gap-2"><MessageSquare className="size-4 text-inkblue" /><h3 className="font-semibold">Recent activity</h3></div>
              <p className="mt-4 text-sm">Sofia uploaded the editor’s letter.</p>
              <p className="mt-1 text-xs text-muted-foreground">18 June at 10:42</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
