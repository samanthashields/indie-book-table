import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, FileText, Link2, MessageSquare, Paperclip, Pencil, UserRound } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateMilestone } from "@/lib/book-db";
import type { Milestone, RequirementType } from "@/lib/book-data";

const requirementTypes: RequirementType[] = [
  "Request a Service",
  "Attach a File",
  "Complete an Activity Outside the Platform",
  "Approve a Deliverable",
];

const statuses: Milestone["status"][] = ["Not started", "In progress", "Blocked", "On hold", "Complete"];

export function RequirementAction({ type, complete, onComplete }: { type: RequirementType; complete: boolean; onComplete: () => void }) {
  const copy = {
    "Approve a Deliverable": { title: "Review and approve the shared deliverable", body: "Your collaborator’s files appear here for approval.", action: "Approve deliverable", icon: Check },
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
          <Button className="mt-4" variant={complete ? "secondary" : "default"} onClick={onComplete} disabled={complete}>{complete && <Check />}{complete ? "Completed" : copy.action}</Button>
        </div>
      </div>
    </div>
  );
}

function useNotes(milestoneId: string) {
  return useQuery({
    queryKey: ["notes", milestoneId],
    queryFn: async () => {
      const { data, error } = await supabase.from("milestone_notes").select("id, body, created_at").eq("milestone_id", milestoneId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function MilestoneBody({ bookId, milestone: initial, phaseName, compact = false }: { bookId: string; milestone: Milestone; phaseName: string; compact?: boolean }) {
  const [milestone, setMilestone] = useState<Milestone>(initial);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const updateMilestone = useUpdateMilestone(bookId);
  const queryClient = useQueryClient();
  const notes = useNotes(milestone.id);
  const update = (patch: Partial<Milestone>) => setMilestone((current) => ({ ...current, ...patch }));

  const saveNote = useMutation({
    mutationFn: async (body: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("milestone_notes").insert({ milestone_id: milestone.id, author_user_id: userData.user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["notes", milestone.id] });
    },
  });

  const save = () => {
    updateMilestone.mutate(
      { id: milestone.id, patch: { name: milestone.name, description: milestone.description, owner: milestone.owner, requirement: milestone.requirement, status: milestone.status, dueIso: milestone.dueIso ?? "", approval: milestone.approval } },
      { onSuccess: () => { setEditing(false); toast.success("Milestone saved"); }, onError: () => toast.error("Couldn’t save the milestone") },
    );
  };

  const markComplete = () => {
    update({ status: "Complete" });
    updateMilestone.mutate(
      { id: milestone.id, patch: { status: "Complete" } },
      { onSuccess: () => toast.success("Milestone complete"), onError: () => toast.error("Couldn’t update the milestone") },
    );
  };

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
          onSubmit={(event) => { event.preventDefault(); save(); }}
        >
          <label className="block text-sm font-semibold">Milestone name<Input className="mt-2" value={milestone.name} onChange={(event) => update({ name: event.target.value })} /></label>
          <label className="block text-sm font-semibold">Description<Textarea className="mt-2 min-h-24" value={milestone.description} onChange={(event) => update({ description: event.target.value })} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Owner<Input className="mt-2" value={milestone.owner} onChange={(event) => update({ owner: event.target.value })} /></label>
            <label className="block text-sm font-semibold">Due date<Input className="mt-2" type="date" value={milestone.dueIso ?? ""} onChange={(event) => update({ dueIso: event.target.value })} /></label>
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
          <div className="flex gap-3"><Button type="submit" disabled={updateMilestone.isPending}>Save milestone</Button><Button type="button" variant="outline" onClick={() => { setMilestone(initial); setEditing(false); }}>Discard changes</Button></div>
        </form>
      ) : (
        <>
          <section>
            <h3 className="font-serif text-2xl font-semibold">About this milestone</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{milestone.description || "No description yet."}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-inkblue/8 p-3"><UserRound className="mb-2 size-4 text-inkblue" /><p className="text-xs text-muted-foreground">Owner</p><p className="text-sm font-semibold">{milestone.owner}</p></div>
              <div className="rounded-xl bg-amber/15 p-3"><CalendarDays className="mb-2 size-4 text-amber" /><p className="text-xs text-muted-foreground">Due date</p><p className="text-sm font-semibold">{milestone.due ?? "Not set"}</p></div>
              <div className="rounded-xl bg-leaf/15 p-3"><Check className="mb-2 size-4 text-leaf" /><p className="text-xs text-muted-foreground">Approval</p><p className="text-sm font-semibold">{milestone.approval ? "Required" : "Not required"}</p></div>
            </div>
          </section>
          <section>
            <h3 className="mb-3 font-serif text-2xl font-semibold">Requirement</h3>
            <RequirementAction type={milestone.requirement} complete={milestone.status === "Complete"} onComplete={markComplete} />
          </section>
          <section>
            <h3 className="font-serif text-2xl font-semibold">Notes and attachments</h3>
            {(notes.data ?? []).length > 0 && (
              <ul className="mt-3 space-y-2">
                {(notes.data ?? []).map((entry) => (
                  <li key={entry.id} className="rounded-xl bg-secondary p-3 text-sm">
                    <p>{entry.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </li>
                ))}
              </ul>
            )}
            <Textarea className="mt-3 min-h-28" placeholder="Add a note for yourself or your collaborator" value={note} onChange={(event) => setNote(event.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" type="button"><Paperclip />Attach file</Button><Button variant="outline" type="button"><Link2 />Add link</Button><Button type="button" disabled={!note.trim() || saveNote.isPending} onClick={() => saveNote.mutate(note.trim())}>Save note</Button></div>
          </section>
          <section className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="font-serif text-xl font-normal">Collaborator view</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Collaborators you invite see the description, files, due date, and notes for the milestones assigned to them — not your full book cycle.</p>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-5">
              <div className="flex items-center gap-2"><MessageSquare className="size-4 text-inkblue" /><h3 className="font-semibold">Recent activity</h3></div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" />Activity on this milestone will appear here.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
