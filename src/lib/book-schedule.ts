import { suggestPhaseRanges, type ManuscriptStatus } from "@/lib/phase-timeline";

type Schedule = { start: string; target: string; manuscriptStatus: ManuscriptStatus; illustrated: boolean };

export const schedules: Record<string, Schedule> = {
  "salt-lines": { start: "2026-01-12", target: "2026-09-18", manuscriptStatus: "first_draft_done", illustrated: false },
  "river-map": { start: "2026-03-02", target: "2027-02-12", manuscriptStatus: "drafting", illustrated: false },
  "fox-lantern": { start: "2025-11-10", target: "2026-11-03", manuscriptStatus: "edited", illustrated: true },
};

const fallback: Schedule = { start: "2026-01-12", target: "2026-09-18", manuscriptStatus: "first_draft_done", illustrated: false };

export const scheduleFor = (bookId: string) => schedules[bookId] ?? fallback;

export const timelineFor = (bookId: string) => {
  const schedule = scheduleFor(bookId);
  return suggestPhaseRanges(new Date(schedule.start), new Date(schedule.target), schedule.manuscriptStatus, schedule.illustrated);
};
