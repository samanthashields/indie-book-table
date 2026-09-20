import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MilestoneUpdate = Database["public"]["Tables"]["milestones"]["Update"];
type BookUpdate = Database["public"]["Tables"]["books"]["Update"];
type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];
import type { Milestone, Phase, RequirementType } from "@/lib/book-data";
import type { ManuscriptStatus, NeedsFollowUp, TimelineResult } from "@/lib/phase-timeline";
import { needsFollowUp, suggestPhaseRanges } from "@/lib/phase-timeline";
import type { TemplatePhase } from "@/lib/template-data";

export type BookRow = {
  id: string;
  author_id: string;
  title: string;
  subtitle: string | null;
  pen_name: string | null;
  genre: string | null;
  publishing_path: string | null;
  audience: string | null;
  comparables: string | null;
  goals: string | null;
  length_estimate: string | null;
  target_publication_date: string | null;
  start_date: string | null;
  budget: number | null;
  isbn: string | null;
  imprint: string | null;
  trim_size: string | null;
  price: string | null;
  language: string | null;
  series: string | null;
  edition: string | null;
  cover_url: string | null;
  status: string;
  shelf_status: string;
  has_cycle: boolean;
  template_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type MilestoneRow = {
  id: string;
  phase_id: string;
  book_id: string;
  name: string;
  description: string | null;
  owner: string | null;
  owner_user_id: string | null;
  owner_kind: string;
  owner_collaborator_id: string | null;
  requirement_type: string | null;
  instructions: string | null;
  resources: unknown[];
  status: string;
  due_date: string | null;
  approval_required: boolean;
  position: number;
  track: string | null;
  provision: string | null;
  depends_on: string[];
  updated_at: string;
};

type PhaseRow = {
  id: string;
  book_id: string;
  key: string;
  name: string;
  type: string;
  position: number;
  status: string;
  suggested_start: string | null;
  suggested_end: string | null;
  hidden: boolean;
};

export type BookSummary = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorId: string;
  isMine: boolean;
  hasCycle: boolean;
  genre: string;
  status: string;
  shelfStatus: string;
  progress: number;
  stepsDone: number;
  stepsTotal: number;
  phaseKey: string | null;
  phaseName: string | null;
  nextAction: string;
  target: string;
  coverUrl: string | null;
  startDate: string | null;
  metadata: Record<string, unknown>;
  needsFollowUp: NeedsFollowUp;
};


export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
export const formatShortDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : undefined;

/** Some rows store the status as a slug (for example "not-started"); use the label form everywhere. */
const normalizeStatus = (value: string | null): Milestone["status"] => {
  const key = (value ?? "").toLowerCase().replace(/[\s_-]+/g, " ").trim();
  return ({ "not started": "Not started", "in progress": "In progress", blocked: "Blocked", "on hold": "On hold", complete: "Complete", completed: "Complete" } as Record<string, Milestone["status"]>)[key] ?? "Not started";
};

const milestoneToUi = (row: MilestoneRow): Milestone => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  owner: row.owner ?? "Author",
  ownerKind: (row.owner_kind as Milestone["ownerKind"]) ?? "author",
  ownerCollaboratorId: row.owner_collaborator_id,
  requirement: (row.requirement_type ?? "attach_a_file") as RequirementType,
  status: normalizeStatus(row.status),
  track: row.track,
  provision: row.provision as Milestone["provision"],
  dependsOn: row.depends_on ?? [],
  approval: row.approval_required,
  ...(formatShortDate(row.due_date) ? { due: formatShortDate(row.due_date)! } : {}),
  ...(row.due_date ? { dueIso: row.due_date } : {}),
});

type PhaseLookup = Map<string, { key: string; name: string; position: number; suggested_start: string | null; suggested_end: string | null }>;

const summarize = (
  book: BookRow,
  milestones: MilestoneRow[],
  authorName: string,
  currentUserId: string | undefined,
  phaseById: PhaseLookup = new Map(),
): BookSummary => {
  // Milestone positions restart in every phase, so order by phase first.
  const sorted = [...milestones].sort((a, b) => (phaseById.get(a.phase_id)?.position ?? 0) - (phaseById.get(b.phase_id)?.position ?? 0) || a.position - b.position);
  const done = sorted.filter((m) => m.status === "Complete").length;
  const progress = sorted.length ? Math.round((done / sorted.length) * 100) : 0;
  const next = sorted.find((m) => m.status === "In progress") ?? sorted.find((m) => m.status !== "Complete");
  const phase = next ? phaseById.get(next.phase_id) : undefined;

  const milestonesByPhase = new Map<string, MilestoneRow[]>();
  for (const milestone of milestones) milestonesByPhase.set(milestone.phase_id, [...(milestonesByPhase.get(milestone.phase_id) ?? []), milestone]);
  const phasesForPacing = [...milestonesByPhase.entries()].map(([phaseId, phaseMilestones]) => {
    const row = phaseById.get(phaseId);
    const range = row?.suggested_start ? { start: new Date(`${row.suggested_start}T00:00:00`), end: row.suggested_end ? new Date(`${row.suggested_end}T00:00:00`) : null } : undefined;
    return { range, complete: phaseMilestones.every((m) => m.status === "Complete") };
  });
  const lastActivityAt = milestones.length > 0 ? new Date(Math.max(...milestones.map((m) => new Date(m.updated_at).getTime()))) : null;
  const targetDate = book.target_publication_date ? new Date(`${book.target_publication_date}T00:00:00`) : null;

  return {
    id: book.id,
    title: book.title,
    ...(book.subtitle ? { subtitle: book.subtitle } : {}),
    author: book.pen_name || authorName,
    authorId: book.author_id,
    isMine: book.author_id === currentUserId,
    hasCycle: Boolean(book.has_cycle),
    genre: book.genre ?? "Uncategorised",
    status: book.status === "active" ? "In progress" : book.status,
    shelfStatus: book.shelf_status ?? "idea",
    progress,
    stepsDone: done,
    stepsTotal: sorted.length,
    phaseKey: phase?.key ?? null,
    phaseName: phase?.name ?? null,
    nextAction: next?.name ?? "All milestones complete",
    target: formatDate(book.target_publication_date) || "No target date",
    coverUrl: book.cover_url,
    startDate: book.start_date,
    metadata: book.metadata ?? {},
    needsFollowUp: needsFollowUp({
      phases: phasesForPacing,
      lastActivityAt,
      targetDate,
      cycleComplete: book.status === "complete" || (sorted.length > 0 && done === sorted.length),
    }),
  };
};

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: async (): Promise<BookSummary[]> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const { data: profile } = userId
        ? await supabase.from("profiles").select("display_name, pen_name").eq("user_id", userId).maybeSingle()
        : { data: null };
      const authorName = profile?.pen_name || profile?.display_name || "You";
      const { data: bookRows, error } = await supabase.from("books").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (bookRows ?? []) as BookRow[];
      if (rows.length === 0) return [];
      const bookIds = rows.map((row) => row.id);
      const [{ data: milestoneRows, error: milestoneError }, { data: phaseRows }] = await Promise.all([
        supabase.from("milestones").select("*").in("book_id", bookIds),
        supabase.from("phases").select("id, key, name, suggested_start, suggested_end, position").in("book_id", bookIds),
      ]);
      if (milestoneError) throw milestoneError;
      const phaseById: PhaseLookup = new Map();
      for (const phase of phaseRows ?? []) phaseById.set(phase.id, { key: phase.key, name: phase.name, position: phase.position, suggested_start: phase.suggested_start, suggested_end: phase.suggested_end });
      const grouped = new Map<string, MilestoneRow[]>();
      for (const milestone of (milestoneRows ?? []) as MilestoneRow[]) {
        grouped.set(milestone.book_id, [...(grouped.get(milestone.book_id) ?? []), milestone]);
      }
      return rows.map((row) => summarize(row, grouped.get(row.id) ?? [], authorName, userId, phaseById));
    },
  });
}


export type BookTree = {
  book: BookRow;
  phases: Phase[];
  timeline: TimelineResult;
  collaboratorCount: number;
  needsFollowUp: NeedsFollowUp;
};

export function useBookTree(bookId: string) {
  return useQuery({
    queryKey: ["book", bookId],
    queryFn: async (): Promise<BookTree> => {
      const [{ data: book, error }, { data: phaseRows, error: phaseError }, { data: milestoneRows, error: milestoneError }, { count }] = await Promise.all([
        supabase.from("books").select("*").eq("id", bookId).single(),
        supabase.from("phases").select("*").eq("book_id", bookId).order("position"),
        supabase.from("milestones").select("*").eq("book_id", bookId).order("position"),
        supabase.from("collaborators").select("id", { count: "exact", head: true }).eq("book_id", bookId).neq("status", "removed"),
      ]);
      if (error) throw error;
      if (phaseError) throw phaseError;
      if (milestoneError) throw milestoneError;
      const typedBook = book as BookRow;
      const metadata = (typedBook.metadata ?? {}) as { manuscriptStatus?: ManuscriptStatus; illustrated?: boolean };
      const start = typedBook.start_date ? new Date(`${typedBook.start_date}T00:00:00`) : new Date();
      const target = typedBook.target_publication_date ? new Date(`${typedBook.target_publication_date}T00:00:00`) : new Date(start.getTime() + 365 * 86400000);
      const timeline = suggestPhaseRanges(start, target, metadata.manuscriptStatus ?? "drafting", metadata.illustrated ?? false);
      const typedMilestoneRows = (milestoneRows ?? []) as MilestoneRow[];
      const phases: Phase[] = ((phaseRows ?? []) as PhaseRow[]).map((phase) => ({
        id: phase.key,
        name: phase.name,
        mode: (phase.type === "launch-window" ? "Launch window" : phase.type === "loop" ? "Loop" : "Sprint") as Phase["mode"],
        summary: ((typedBook.metadata as Record<string, Record<string, string> | undefined>)?.["phaseSummaries"]?.[phase.key]) ?? "",
        milestones: typedMilestoneRows.filter((m) => m.phase_id === phase.id).map(milestoneToUi),
        hidden: phase.hidden,
      }));
      const lastActivityAt = typedMilestoneRows.length > 0 ? new Date(Math.max(...typedMilestoneRows.map((m) => new Date(m.updated_at).getTime()))) : null;
      const allMilestonesDone = typedMilestoneRows.length > 0 && typedMilestoneRows.every((m) => m.status === "Complete");
      const bookNeedsFollowUp = needsFollowUp({
        phases: phases.map((phase) => ({
          range: timeline.ranges[phase.id as keyof typeof timeline.ranges],
          complete: phase.milestones.length > 0 && phase.milestones.every((m) => m.status === "Complete"),
        })),
        lastActivityAt,
        targetDate: typedBook.target_publication_date ? target : null,
        cycleComplete: typedBook.status === "complete" || allMilestonesDone,
      });
      return { book: typedBook, phases, timeline, collaboratorCount: count ?? 0, needsFollowUp: bookNeedsFollowUp };
    },
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("*").order("position");
      if (error) throw error;
      return (data ?? []) as unknown as (Omit<TemplateRow, "details" | "phases"> & {
        details: { illustrated?: boolean; highlights?: string[] };
        phases: TemplatePhase[];
      })[];
    },
  });
}

export type CreateCycleInput = {
  title: string;
  genre?: string;
  targetDate?: string;
  manuscriptStatus?: ManuscriptStatus;
  illustrated?: boolean;
  templateId?: string;
  phases: TemplatePhase[];
  summaryNote?: string;
  budget?: number;
  formats?: string[];
  /** When set, the cycle is attached to an existing book in the library. */
  bookId?: string;
};

export function useCreateBookCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCycleInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You need to be signed in.");
      const payload = {
        title: input.title,
        genre: input.genre ?? null,
        target_publication_date: input.targetDate ?? null,
        template_id: input.templateId ?? null,
        status: "active",
        has_cycle: true,
        budget: input.budget ?? null,
        formats: input.formats ?? [],
        metadata: {
          manuscriptStatus: input.manuscriptStatus ?? "drafting",
          illustrated: input.illustrated ?? false,
          phaseSummaries: Object.fromEntries(input.phases.map((phase) => [phase.id, phase.summary])),
        },
      };
      let book: { id: string };
      if (input.bookId) {
        const { data, error } = await supabase.from("books").update(payload).eq("id", input.bookId).select("id").single();
        if (error) throw error;
        book = data as { id: string };
      } else {
        const { data, error } = await supabase
          .from("books")
          .insert({ author_id: userData.user.id, ...payload })
          .select("id")
          .single();
        if (error) throw error;
        book = data as { id: string };
      }


      const target = input.targetDate ? new Date(`${input.targetDate}T00:00:00`) : new Date(Date.now() + 365 * 86400000);
      const timeline = suggestPhaseRanges(new Date(), target, input.manuscriptStatus ?? "drafting", input.illustrated ?? false);

      // Earlier phases than the manuscript's actual starting point are omitted rather than
      // created with no timeline — timeline.ranges only has entries for the phases that are
      // actually active (plus launch/post_launch_growth), so it doubles as the active-phase set.
      // When the date is too tight to compute a timeline at all, fall back to creating every
      // phase rather than silently dropping all of them.
      const activePhases = timeline.valid ? input.phases.filter((phase) => phase.id in timeline.ranges) : input.phases;

      for (const [index, phase] of activePhases.entries()) {
        const range = timeline.ranges[phase.id as keyof typeof timeline.ranges];
        const tracks = [...new Set(phase.milestones.map((m) => m.track).filter((t): t is string => Boolean(t)))];
        const { data: phaseRow, error: phaseError } = await supabase
          .from("phases")
          .insert({
            book_id: book.id,
            key: phase.id,
            name: phase.name,
            type: phase.mode === "Launch window" ? "launch-window" : phase.mode.toLowerCase(),
            position: index,
            starts_here: index === 0,
            suggested_start: range?.start ? range.start.toISOString().slice(0, 10) : null,
            suggested_end: range?.end ? range.end.toISOString().slice(0, 10) : null,
            tracks: tracks.length > 0 ? tracks : null,
            hidden: phase.hidden ?? false,
          })
          .select("id")
          .single();
        if (phaseError) throw phaseError;
        if (phase.milestones.length > 0) {
          const { data: milestoneRows, error: milestoneError } = await supabase
            .from("milestones")
            .insert(
              phase.milestones.map((milestone, milestoneIndex) => ({
                phase_id: phaseRow.id,
                book_id: book.id,
                name: milestone.name,
                description: milestone.note,
                requirement_type: milestone.requirement,
                position: milestoneIndex,
                track: milestone.track ?? null,
                provision: milestone.provision ?? null,
              })),
            )
            .select("id");
          if (milestoneError) throw milestoneError;

          // depends_on is advisory-only and references the plan's own localIds, which the
          // picker only ever offers from the same phase — so this phase's milestones and their
          // just-inserted real ids are both in hand right here, no cross-phase bookkeeping needed.
          const localToReal = new Map(phase.milestones.map((milestone, i) => [milestone.localId, milestoneRows![i]!.id]));
          for (const [i, milestone] of phase.milestones.entries()) {
            const resolved = (milestone.dependsOn ?? [])
              .map((localId) => localToReal.get(localId))
              .filter((id): id is string => Boolean(id));
            if (resolved.length > 0) {
              const { error: dependsOnError } = await supabase.from("milestones").update({ depends_on: resolved }).eq("id", milestoneRows![i]!.id);
              if (dependsOnError) throw dependsOnError;
            }
          }
        }
      }
      await supabase.from("activity").insert({ book_id: book.id, actor_user_id: userData.user.id, text: `Created the book cycle for “${input.title}”.` });
      return book.id as string;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["books"] }),
  });
}

const statusToDb: Record<Milestone["status"], string> = {
  "Not started": "Not started",
  "In progress": "In progress",
  Blocked: "Blocked",
  "On hold": "On hold",
  Complete: "Complete",
};

export function useUpdateMilestone(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Milestone> }) => {
      const update: MilestoneUpdate = {};
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.description !== undefined) update.description = patch.description;
      if (patch.owner !== undefined) update.owner = patch.owner;
      if (patch.ownerKind !== undefined) update.owner_kind = patch.ownerKind;
      if (patch.ownerCollaboratorId !== undefined) update.owner_collaborator_id = patch.ownerCollaboratorId;
      if (patch.requirement !== undefined) update.requirement_type = patch.requirement;
      if (patch.track !== undefined) update.track = patch.track;
      if (patch.provision !== undefined) update.provision = patch.provision;
      if (patch.dependsOn !== undefined) update.depends_on = patch.dependsOn;
      if (patch.status !== undefined) {
        update.status = statusToDb[patch.status];
        update.completed_at = patch.status === "Complete" ? new Date().toISOString() : null;
      }
      if (patch.dueIso !== undefined) update.due_date = patch.dueIso || null;
      if (patch.approval !== undefined) update.approval_required = patch.approval;
      const { error } = await supabase.from("milestones").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      // Names, progress and the next action on My Books and My Cycles come from the same rows.
      void queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export type CompletionSource = "manual" | "auto";

/**
 * Marks a milestone complete. A manual completion always applies. An automatic
 * one (file uploaded, link attached) only applies while the milestone is still
 * open, so it can never overwrite a manual completion — including one made from
 * another tab or device, which the conditional update catches server-side.
 */
export function useCompleteMilestone(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, source }: { id: string; source: CompletionSource }) => {
      let query = supabase.from("milestones").update({ status: "Complete", completed_at: new Date().toISOString() }).eq("id", id);
      if (source === "auto") query = query.neq("status", "Complete");
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      void queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useUpdateBook(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: BookUpdate) => {
      const { error } = await supabase.from("books").update(patch).eq("id", bookId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      void queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export type ReflectionData = {
  achieved_goals: boolean | null;
  goals_notes: string | null;
  published_on_time: boolean | null;
  next_steps: string | null;
  custom: { prompt: string; answer: string }[];
  completed_at: string | null;
};

export function useReflection(bookId: string) {
  return useQuery({
    queryKey: ["reflection", bookId],
    queryFn: async (): Promise<ReflectionData | null> => {
      const { data, error } = await supabase.from("reflections").select("*").eq("book_id", bookId).maybeSingle();
      if (error) throw error;
      return data as ReflectionData | null;
    },
  });
}

export function useSaveReflection(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ReflectionData, "completed_at">) => {
      const { error } = await supabase.from("reflections").upsert(
        { book_id: bookId, ...data, completed_at: new Date().toISOString() },
        { onConflict: "book_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["reflection", bookId] }),
  });
}

/** Saves a book idea to the library, without starting a cycle yet. */
export function useCreateBookIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; subtitle?: string; pen_name?: string; genre?: string; audience?: string; goals?: string; target_publication_date?: string; shelf_status?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You need to be signed in.");
      const { data, error } = await supabase
        .from("books")
        .insert({
          author_id: userData.user.id,
          title: input.title,
          subtitle: input.subtitle || null,
          pen_name: input.pen_name || null,
          genre: input.genre || null,
          audience: input.audience || null,
          goals: input.goals || null,
          target_publication_date: input.target_publication_date || null,
          status: "idea",
          shelf_status: input.shelf_status || "idea",
          has_cycle: false,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase.from("books").delete().eq("id", bookId);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["books"] }),
  });
}

export type AuthorTemplateInput = {
  title: string;
  description?: string;
  genre?: string;
  audience?: string;
  duration?: string;
  phases: TemplatePhase[];
  details?: { illustrated?: boolean; highlights?: string[] };
};

export function useSaveAuthorTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: AuthorTemplateInput }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You need to be signed in.");
      const payload = {
        owner_id: userData.user.id,
        title: input.title,
        description: input.description ?? null,
        genre: input.genre ?? null,
        audience: input.audience ?? null,
        duration: input.duration ?? null,
        phases: input.phases as unknown as never,
        details: (input.details ?? {}) as unknown as never,
        published: false,
        archived: false,
      };
      if (id) {
        const { error } = await supabase.from("templates").update(payload).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("templates").insert(payload).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useDeleteAuthorTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
}

/**
 * Removes a book's cycle (phases, milestones, notes, steps, setup tasks and reflection)
 * but keeps the book itself on the author's shelf as an idea.
 */
export function useDeleteBookCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data, error } = await supabase.rpc("delete_book_cycle", { _book_id: bookId });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, bookId) => {
      void queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.removeQueries({ queryKey: ["book", bookId] });
      for (const key of ["setup-tasks", "reflection", "resources"]) void queryClient.invalidateQueries({ queryKey: [key, bookId] });
    },
  });
}
