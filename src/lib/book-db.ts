import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MilestoneUpdate = Database["public"]["Tables"]["milestones"]["Update"];
type BookUpdate = Database["public"]["Tables"]["books"]["Update"];
type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];
import type { Milestone, Phase, RequirementType } from "@/lib/book-data";
import type { ManuscriptStatus, TimelineResult } from "@/lib/phase-timeline";
import { suggestPhaseRanges } from "@/lib/phase-timeline";
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
  requirement_type: string | null;
  instructions: string | null;
  resources: unknown[];
  status: string;
  due_date: string | null;
  approval_required: boolean;
  position: number;
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
  progress: number;
  nextAction: string;
  target: string;
  coverUrl: string | null;
  startDate: string | null;
  metadata: Record<string, unknown>;
};

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
export const formatShortDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : undefined;

const milestoneToUi = (row: MilestoneRow): Milestone => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  owner: row.owner ?? "Author",
  requirement: (row.requirement_type ?? "Attach a File") as RequirementType,
  status: (row.status as Milestone["status"]) ?? "Not started",
  approval: row.approval_required,
  ...(formatShortDate(row.due_date) ? { due: formatShortDate(row.due_date)! } : {}),
  ...(row.due_date ? { dueIso: row.due_date } : {}),
});

const summarize = (book: BookRow, milestones: MilestoneRow[], authorName: string): BookSummary => {
  const sorted = [...milestones].sort((a, b) => a.position - b.position);
  const done = sorted.filter((m) => m.status === "Complete").length;
  const progress = sorted.length ? Math.round((done / sorted.length) * 100) : 0;
  const next = sorted.find((m) => m.status === "In progress") ?? sorted.find((m) => m.status !== "Complete");
  const activePhase = next?.phase_id;
  return {
    id: book.id,
    title: book.title,
    ...(book.subtitle ? { subtitle: book.subtitle } : {}),
    author: book.pen_name || authorName,
    genre: book.genre ?? "Uncategorised",
    status: book.status === "active" ? "In progress" : book.status,
    progress,
    nextAction: next?.name ?? "All milestones complete",
    target: formatDate(book.target_publication_date) || "No target date",
    coverUrl: book.cover_url,
    startDate: book.start_date,
    metadata: book.metadata ?? {},
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
      const { data: milestoneRows, error: milestoneError } = await supabase
        .from("milestones")
        .select("*")
        .in("book_id", rows.map((row) => row.id));
      if (milestoneError) throw milestoneError;
      const grouped = new Map<string, MilestoneRow[]>();
      for (const milestone of (milestoneRows ?? []) as MilestoneRow[]) {
        grouped.set(milestone.book_id, [...(grouped.get(milestone.book_id) ?? []), milestone]);
      }
      return rows.map((row) => summarize(row, grouped.get(row.id) ?? [], authorName));
    },
  });
}

export type BookTree = {
  book: BookRow;
  phases: Phase[];
  timeline: TimelineResult;
  collaboratorCount: number;
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
      const phases: Phase[] = ((phaseRows ?? []) as PhaseRow[]).map((phase) => ({
        id: phase.key,
        name: phase.name,
        mode: (phase.type === "launch-window" ? "Launch window" : phase.type === "loop" ? "Loop" : "Sprint") as Phase["mode"],
        summary: ((typedBook.metadata as Record<string, Record<string, string> | undefined>)?.["phaseSummaries"]?.[phase.key]) ?? "",
        milestones: ((milestoneRows ?? []) as MilestoneRow[]).filter((m) => m.phase_id === phase.id).map(milestoneToUi),
      }));
      return { book: typedBook, phases, timeline, collaboratorCount: count ?? 0 };
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
};

export function useCreateBookCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCycleInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You need to be signed in.");
      const { data: book, error } = await supabase
        .from("books")
        .insert({
          author_id: userData.user.id,
          title: input.title,
          genre: input.genre ?? null,
          target_publication_date: input.targetDate ?? null,
          template_id: input.templateId ?? null,
          metadata: {
            manuscriptStatus: input.manuscriptStatus ?? "drafting",
            illustrated: input.illustrated ?? false,
            phaseSummaries: Object.fromEntries(input.phases.map((phase) => [phase.id, phase.summary])),
          },
        })
        .select("id")
        .single();
      if (error) throw error;

      const target = input.targetDate ? new Date(`${input.targetDate}T00:00:00`) : new Date(Date.now() + 365 * 86400000);
      const timeline = suggestPhaseRanges(new Date(), target, input.manuscriptStatus ?? "drafting", input.illustrated ?? false);

      for (const [index, phase] of input.phases.entries()) {
        const range = timeline.ranges[phase.id as keyof typeof timeline.ranges];
        const { data: phaseRow, error: phaseError } = await supabase
          .from("phases")
          .insert({
            book_id: book.id,
            key: phase.id,
            name: phase.name,
            type: phase.mode === "Launch window" ? "launch-window" : phase.mode.toLowerCase(),
            position: index,
            suggested_start: range?.start ? range.start.toISOString().slice(0, 10) : null,
            suggested_end: range?.end ? range.end.toISOString().slice(0, 10) : null,
          })
          .select("id")
          .single();
        if (phaseError) throw phaseError;
        if (phase.milestones.length > 0) {
          const { error: milestoneError } = await supabase.from("milestones").insert(
            phase.milestones.map((milestone, milestoneIndex) => ({
              phase_id: phaseRow.id,
              book_id: book.id,
              name: milestone.name,
              description: milestone.note,
              requirement_type: milestone.requirement,
              position: milestoneIndex,
            })),
          );
          if (milestoneError) throw milestoneError;
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
      if (patch.requirement !== undefined) update.requirement_type = patch.requirement;
      if (patch.status !== undefined) {
        update.status = statusToDb[patch.status];
        update.completed_at = patch.status === "Complete" ? new Date().toISOString() : null;
      }
      if (patch.dueIso !== undefined) update.due_date = patch.dueIso || null;
      if (patch.approval !== undefined) update.approval_required = patch.approval;
      const { error } = await supabase.from("milestones").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["book", bookId] }),
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
