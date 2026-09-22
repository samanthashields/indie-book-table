import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Check, CheckCircle2, FileText, HardDrive, Link2, MessageSquare, Paperclip, Pencil, UserRound } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/status-pill";
import { MilestoneChecklistPanel } from "@/components/milestone-checklist-panel";
import { MilestoneResources } from "@/components/milestone-resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCompleteMilestone, useUpdateMilestone, type CompletionSource } from "@/lib/book-db";
import { uploadBookFile, useFileUrl } from "@/lib/book-files";
import { useCollaborators } from "@/lib/collaborators";
import { OWNER_KINDS, PROVISIONS, REQUIREMENT_TYPES, ownerKindLabel, provisionLabel, requirementLabel } from "@/lib/book-data";
import type { Collaborator } from "@/lib/collaborators";
import type { Milestone, OwnerKind, Provision, RequirementType } from "@/lib/book-data";

const statuses: Milestone["status"][] = ["Not started", "In progress", "Blocked", "On hold", "Complete"];

/** The owner's display text — "Author"/"Unassigned", or the named collaborator when one is set. */
function ownerDisplay(kind: OwnerKind, collaboratorId: string | null, roster: Collaborator[]): string {
  if (kind === "unassigned") return "Unassigned — hire";
  if (kind === "collaborator") {
    const match = roster.find((c) => c.id === collaboratorId);
    return match ? match.name || match.email : "Collaborator";
  }
  return "Author";
}

export function RequirementAction({
  bookId,
  type,
  complete,
  onComplete,
  onAttach,
}: {
  bookId: string;
  type: RequirementType;
  complete: boolean;
  onComplete: (source: CompletionSource) => void;
  onAttach: (path: string, name: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [driveOpen, setDriveOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const copy = {
    approve_a_deliverable: { title: "Review and approve the shared deliverable", body: "Your collaborator’s files appear here for approval.", action: "Approve deliverable", icon: Check },
    attach_a_file: { title: "Add the finished file or a share link", body: "PDF, DOCX, EPUB, or a link to your working document.", action: "Choose file", icon: Paperclip },
    request_a_service: { title: "Invite a specialist to this milestone", body: "They’ll only see this book cycle and the work assigned to them.", action: "Invite a collaborator", icon: UserRound },
    complete_activity_outside: { title: "Finish this work in your usual tools", body: "Mark it complete here when the outside work is done.", action: "Mark complete", icon: Check },
  }[type];
  const Icon = copy.icon;

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadBookFile(bookId, "deliverables", file);
      onAttach(path, file.name);
      onComplete("auto");
      toast.success("File attached");
    } catch {
      toast.error("Couldn’t upload that file");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-teal/40 bg-teal/10 p-5">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-link shadow-xs"><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{copy.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
          {type === "request_a_service" ? (
            <Button className="mt-4" asChild><Link to="/books/$bookId/team" params={{ bookId }}><UserRound />{copy.action}</Link></Button>
          ) : type === "attach_a_file" ? (
            <>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant={complete ? "secondary" : "default"} disabled={busy} onClick={() => input.current?.click()}>{complete && <Check />}{busy ? "Uploading…" : complete ? "Replace file" : copy.action}</Button>
                <Button variant="outline" onClick={() => setDriveOpen((value) => !value)}><HardDrive />Add from Google Drive</Button>
              </div>
              <input ref={input} type="file" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
              {driveOpen && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <Input
                    className="h-9 max-w-md flex-1"
                    placeholder="https://drive.google.com/file/d/…"
                    aria-label="Google Drive link"
                    value={driveLink}
                    onChange={(event) => setDriveLink(event.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const url = driveLink.trim();
                      if (!/^https:\/\/(drive|docs)\.google\.com\//.test(url)) {
                        toast.error("Paste a link that starts with drive.google.com or docs.google.com");
                        return;
                      }
                      onAttach(url, "Google Drive file");
                      onComplete("auto");
                      setDriveLink("");
                      setDriveOpen(false);
                      toast.success("Google Drive file linked");
                    }}
                  >
                    Attach link
                  </Button>
                  <p className="w-full text-xs text-muted-foreground">Make sure the file is shared with anyone who needs to open it.</p>
                </div>
              )}
            </>
          ) : (
            <Button className="mt-4" variant={complete ? "secondary" : "default"} onClick={() => onComplete("manual")} disabled={complete}>{complete && <Check />}{complete ? "Completed" : copy.action}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

type NoteRow = { id: string; body: string; created_at: string; attachment_path: string | null };

function useNotes(milestoneId: string) {
  return useQuery({
    queryKey: ["notes", milestoneId],
    queryFn: async () => {
      const { data, error } = await supabase.from("milestone_notes").select("id, body, created_at, attachment_path").eq("milestone_id", milestoneId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NoteRow[];
    },
  });
}

function NoteAttachment({ path }: { path: string }) {
  const url = useFileUrl(path);
  const name = path.split("/").pop() ?? "attachment";
  if (!url.data) return <p className="mt-2 text-xs text-muted-foreground">Preparing attachment…</p>;
  return <a href={url.data} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-link underline-offset-2 hover:underline"><Paperclip className="size-3" />{name.replace(/^\d+-/, "")}</a>;
}

export function MilestoneBody({ bookId, milestone: initial, phaseName, compact = false }: { bookId: string; milestone: Milestone; phaseName: string; compact?: boolean }) {
  const [milestone, setMilestone] = useState<Milestone>(initial);
  const [saved, setSaved] = useState<Milestone>(initial);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState<{ path: string; name: string } | null>(null);
  const noteFile = useRef<HTMLInputElement>(null);
  const updateMilestone = useUpdateMilestone(bookId);
  const completeMilestone = useCompleteMilestone(bookId);
  const collaborators = useCollaborators(bookId);
  const roster = collaborators.data ?? [];
  const queryClient = useQueryClient();
  const notes = useNotes(milestone.id);
  const update = (patch: Partial<Milestone>) => setMilestone((current) => ({ ...current, ...patch }));

  const saveNote = useMutation({
    mutationFn: async ({ body, path }: { body: string; path: string | null }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("milestone_notes").insert({ milestone_id: milestone.id, author_user_id: userData.user.id, body, attachment_path: path });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      setAttachment(null);
      void queryClient.invalidateQueries({ queryKey: ["notes", milestone.id] });
    },
    onError: () => toast.error("Couldn’t save that note"),
  });

  const pickNoteFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const path = await uploadBookFile(bookId, "notes", file);
      setAttachment({ path, name: file.name });
      toast.success("File ready to save with your note");
    } catch {
      toast.error("Couldn’t upload that file");
    } finally {
      if (noteFile.current) noteFile.current.value = "";
    }
  };

  const addLink = () => {
    const url = window.prompt("Paste a link to add to this milestone");
    if (!url) return;
    setNote((current) => (current ? `${current}\n${url}` : url));
  };

  const save = () => {
    updateMilestone.mutate(
      {
        id: milestone.id,
        patch: {
          name: milestone.name,
          description: milestone.description,
          ownerKind: milestone.ownerKind,
          ownerCollaboratorId: milestone.ownerCollaboratorId,
          owner: ownerDisplay(milestone.ownerKind, milestone.ownerCollaboratorId, roster),
          requirement: milestone.requirement,
          track: milestone.track,
          provision: milestone.provision,
          // Only send the status when it changed, so an unrelated edit does not reset the completion date.
          ...(milestone.status !== saved.status ? { status: milestone.status } : {}),
          dueIso: milestone.dueIso ?? "",
          approval: Boolean(milestone.approval),
        },
      },
      { onSuccess: () => { setSaved(milestone); setEditing(false); toast.success("Milestone saved"); }, onError: () => toast.error("Couldn’t save the milestone") },
    );
  };

  const markComplete = (source: CompletionSource) => {
    // An automatic completion (an upload, a linked file) must not overwrite one the author already made.
    if (source === "auto" && milestone.status === "Complete") return;
    update({ status: "Complete" });
    setSaved((current) => ({ ...current, status: "Complete" }));
    completeMilestone.mutate(
      { id: milestone.id, source },
      { onSuccess: () => toast.success("Milestone complete"), onError: () => toast.error("Couldn’t update the milestone") },
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2"><StatusPill>{phaseName}</StatusPill><StatusPill tone={milestone.status === "Complete" ? "good" : milestone.status === "Blocked" ? "danger" : "warm"}>{milestone.status}</StatusPill></div>
          <h2 className={compact ? "font-heading text-3xl font-normal" : "font-heading text-4xl font-normal md:text-5xl"}>{milestone.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {milestone.status !== "Complete" && !editing && (
            <Button variant="secondary" disabled={completeMilestone.isPending} onClick={() => markComplete("manual")}><CheckCircle2 />Mark as complete</Button>
          )}
          <Button variant={editing ? "secondary" : "outline"} onClick={() => { if (editing) setMilestone(saved); setEditing((value) => !value); }}><Pencil />{editing ? "Cancel edit" : "Edit milestone"}</Button>
        </div>
      </div>

      {editing ? (
        <form
          className="space-y-5 rounded-2xl border border-border bg-paper p-5"
          onSubmit={(event) => { event.preventDefault(); save(); }}
        >
          <label className="block text-sm font-semibold">Milestone name<Input className="mt-2" value={milestone.name} onChange={(event) => update({ name: event.target.value })} /></label>
          <label className="block text-sm font-semibold">Description<Textarea className="mt-2 min-h-24" value={milestone.description} onChange={(event) => update({ description: event.target.value })} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Owner
              <select
                className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm"
                value={milestone.ownerKind}
                onChange={(event) => {
                  const kind = event.target.value as OwnerKind;
                  update({ ownerKind: kind, ...(kind === "collaborator" ? {} : { ownerCollaboratorId: null }) });
                }}
              >
                {OWNER_KINDS.map((kind) => <option key={kind} value={kind}>{ownerKindLabel[kind]}</option>)}
              </select>
            </label>
            {milestone.ownerKind === "collaborator" && (
              <label className="block text-sm font-semibold sm:col-span-2">Assigned collaborator
                {roster.length > 0 ? (
                  <select
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm"
                    value={milestone.ownerCollaboratorId ?? ""}
                    onChange={(event) => update({ ownerCollaboratorId: event.target.value || null })}
                  >
                    <option value="">Choose a collaborator…</option>
                    {roster.map((c) => <option key={c.id} value={c.id}>{c.name || c.email} — {c.role}</option>)}
                  </select>
                ) : (
                  <p className="mt-2 text-sm font-normal text-muted-foreground">
                    No collaborators yet. <Link to="/books/$bookId/team" params={{ bookId }} className="font-semibold text-link underline-offset-2 hover:underline">Invite one from the Team page</Link>.
                  </p>
                )}
              </label>
            )}
            <label className="block text-sm font-semibold">Due date<Input className="mt-2" type="date" value={milestone.dueIso ?? ""} onChange={(event) => update({ dueIso: event.target.value })} /></label>
            <label className="block text-sm font-semibold">Requirement
              <select className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" value={milestone.requirement} onChange={(event) => update({ requirement: event.target.value as RequirementType })}>
                {REQUIREMENT_TYPES.map((type) => <option key={type} value={type}>{requirementLabel[type]}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Status
              <select className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" value={milestone.status} onChange={(event) => update({ status: event.target.value as Milestone["status"] })}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Track<Input className="mt-2" placeholder="Optional — e.g. text, design, publishing" value={milestone.track ?? ""} onChange={(event) => update({ track: event.target.value || null })} /></label>
            <label className="block text-sm font-semibold">Provision
              <select className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" value={milestone.provision ?? ""} onChange={(event) => update({ provision: (event.target.value || null) as Provision | null })}>
                <option value="">Not set</option>
                {PROVISIONS.map((p) => <option key={p} value={p}>{provisionLabel[p]}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="size-4 accent-[var(--teal)]" checked={Boolean(milestone.approval)} onChange={(event) => update({ approval: event.target.checked })} />Approval required</label>
          <div className="flex gap-3"><Button type="submit" disabled={updateMilestone.isPending}>Save milestone</Button><Button type="button" variant="outline" onClick={() => { setMilestone(saved); setEditing(false); }}>Discard changes</Button></div>
        </form>
      ) : (
        <>
          <section>
            <h3 className="font-heading text-2xl font-semibold">About this milestone</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{milestone.description || "No description yet."}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-inkblue/8 p-3"><UserRound className="mb-2 size-4 text-text-inkblue" /><p className="text-xs text-muted-foreground">Owner</p><p className="text-sm font-semibold">{ownerDisplay(milestone.ownerKind, milestone.ownerCollaboratorId, roster)}</p></div>
              <div className="rounded-xl bg-amber/15 p-3"><CalendarDays className="mb-2 size-4 text-amber" /><p className="text-xs text-muted-foreground">Due date</p><p className="text-sm font-semibold">{milestone.due ?? "Not set"}</p></div>
              <div className="rounded-xl bg-leaf/15 p-3"><Check className="mb-2 size-4 text-text-leaf" /><p className="text-xs text-muted-foreground">Approval</p><p className="text-sm font-semibold">{milestone.approval ? "Required" : "Not required"}</p></div>
              {milestone.track && <div className="rounded-xl bg-secondary p-3"><p className="text-xs text-muted-foreground">Track</p><p className="text-sm font-semibold">{milestone.track}</p></div>}
              {milestone.provision && <div className="rounded-xl bg-secondary p-3"><p className="text-xs text-muted-foreground">Provision</p><p className="text-sm font-semibold">{provisionLabel[milestone.provision]}</p></div>}
            </div>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-2xl font-semibold">Requirement</h3>
            <RequirementAction
              bookId={bookId}
              type={milestone.requirement}
              complete={milestone.status === "Complete"}
              onComplete={markComplete}
              onAttach={(path, name) => saveNote.mutate({ body: `Attached ${name}`, path })}
            />
          </section>
          <MilestoneChecklistPanel bookId={bookId} milestoneId={milestone.id} />
          <MilestoneResources bookId={bookId} milestoneId={milestone.id} />
          <section>
            <h3 className="font-heading text-2xl font-semibold">Notes and attachments</h3>
            {(notes.data ?? []).length > 0 && (
              <ul className="mt-3 space-y-2">
                {(notes.data ?? []).map((entry) => (
                  <li key={entry.id} className="rounded-xl bg-secondary p-3 text-sm">
                    <p className="whitespace-pre-line">{entry.body}</p>
                    {entry.attachment_path && <NoteAttachment path={entry.attachment_path} />}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </li>
                ))}
              </ul>
            )}
            <Textarea className="mt-3 min-h-28" placeholder="Add a note for yourself or your collaborator" value={note} onChange={(event) => setNote(event.target.value)} />
            {attachment && <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-link"><Paperclip className="size-3" />{attachment.name} will be saved with this note</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" type="button" onClick={() => noteFile.current?.click()}><Paperclip />Attach file</Button>
              <input ref={noteFile} type="file" className="sr-only" onChange={(event) => void pickNoteFile(event.target.files?.[0])} />
              <Button variant="outline" type="button" onClick={addLink}><Link2 />Add link</Button>
              <Button type="button" disabled={(!note.trim() && !attachment) || saveNote.isPending} onClick={() => saveNote.mutate({ body: note.trim() || attachment?.name || "Attachment", path: attachment?.path ?? null })}>Save note</Button>
            </div>
          </section>
          <section className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="font-heading text-xl font-normal">Collaborator view</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Collaborators you invite see the description, files, due date, and notes for the milestones assigned to them — not your full book cycle.</p>
              <Button className="mt-4" variant="outline" asChild><Link to="/books/$bookId/team" params={{ bookId }}><UserRound />Manage collaborators</Link></Button>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-5">
              <div className="flex items-center gap-2"><MessageSquare className="size-4 text-text-inkblue" /><h3 className="font-semibold">Recent activity</h3></div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" />{(notes.data ?? []).length > 0 ? `${(notes.data ?? []).length} note${(notes.data ?? []).length === 1 ? "" : "s"} on this milestone.` : "Activity on this milestone will appear here."}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
