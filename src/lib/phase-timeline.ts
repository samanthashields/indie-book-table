export type ManuscriptStatus = "drafting" | "first_draft_done" | "edited";

export type PhaseKey = "writing_development" | "editing" | "production" | "pre_launch" | "launch" | "post_launch_growth";

export type PhaseDef = { key: PhaseKey; name: string; mode: "Loop" | "Sprint" | "Launch window"; summary: string };

/** The six phases every book cycle uses, in order. The single source of truth for phase identity — everything that needs a phase's id/name/mode/summary should build from this instead of hardcoding its own copy. */
export const PHASE_DEFS: PhaseDef[] = [
  { key: "writing_development", name: "Writing & Development", mode: "Loop", summary: "Shape the manuscript, test the premise, and revise with intention." },
  { key: "editing", name: "Editing", mode: "Loop", summary: "Move from structural clarity to clean, confident prose." },
  { key: "production", name: "Production", mode: "Sprint", summary: "Turn the manuscript into a book people can hold and read." },
  { key: "pre_launch", name: "Pre-Launch", mode: "Sprint", summary: "Prepare the listing, early readers, and a realistic launch plan." },
  { key: "launch", name: "Launch", mode: "Launch window", summary: "Publish, verify every storefront, and invite the first readers." },
  { key: "post_launch_growth", name: "Post-Launch & Growth", mode: "Loop", summary: "Learn from the launch and build steady readership." },
];

const WEIGHTS: Record<"writing_development" | "editing" | "production" | "pre_launch", number> = {
  writing_development: 0.356,
  editing: 0.171,
  production: 0.171,
  pre_launch: 0.302,
};

const ACTIVE_FROM: Record<ManuscriptStatus, (keyof typeof WEIGHTS)[]> = {
  drafting: ["writing_development", "editing", "production", "pre_launch"],
  first_draft_done: ["editing", "production", "pre_launch"],
  edited: ["production", "pre_launch"],
};

const day = 86400000;
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * day);
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / day);

export type PhaseRange = { start: Date; end: Date | null; fixed?: boolean };

export type TimelineResult = {
  valid: boolean;
  ranges: Partial<Record<PhaseKey, PhaseRange>>;
  warnings: string[];
  shortfall: number;
  marketingStartBy?: Date;
};

export function suggestPhaseRanges(
  start: Date,
  pub: Date,
  manuscriptStatus: ManuscriptStatus = "drafting",
  illustrated = false,
): TimelineResult {
  const W = daysBetween(start, pub);
  if (W < 35) {
    return { valid: false, ranges: {}, shortfall: 35 - W, warnings: ["This date leaves less than five weeks, which is not enough room for a launch window."] };
  }

  const B = W - 14;
  const floors: Record<keyof typeof WEIGHTS, number> = {
    writing_development: 21,
    editing: 21,
    production: illustrated ? 90 : 30,
    pre_launch: 60,
  };

  const active = ACTIVE_FROM[manuscriptStatus];
  const totalWeight = active.reduce((sum, key) => sum + WEIGHTS[key], 0);
  const durations = {} as Record<keyof typeof WEIGHTS, number>;
  for (const key of active) durations[key] = Math.max(Math.round(B * (WEIGHTS[key] / totalWeight)), floors[key]);

  const used = active.reduce((sum, key) => sum + durations[key], 0);
  const warnings: string[] = [];
  const shortfall = Math.max(0, used - B);
  if (shortfall > 0) {
    warnings.push(
      `This plan needs about ${used} days of build time and your date gives ${B}. Moving publication out by roughly ${shortfall} days would make it realistic, or we can trim the scope.`,
    );
  }

  const ranges: Partial<Record<PhaseKey, PhaseRange>> = {};
  let cursor = start;
  for (const key of active) {
    const end = addDays(cursor, durations[key]);
    ranges[key] = { start: cursor, end };
    cursor = end;
  }
  ranges.launch = { start: addDays(pub, -14), end: addDays(pub, 21), fixed: true };
  ranges.post_launch_growth = { start: addDays(pub, 22), end: null, fixed: true };

  return { valid: true, ranges, warnings, shortfall, marketingStartBy: addDays(pub, -Math.round(B * 0.5)) };
}

const short = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export function formatRange(range?: PhaseRange): string {
  if (!range) return "Not scheduled";
  if (!range.end) return `From ${short.format(range.start)}, ongoing`;
  return `${short.format(range.start)} – ${short.format(range.end)}`;
}

export function pacing(range: PhaseRange | undefined, complete: boolean, now = new Date()): "ahead" | "current" | "behind" | "done" {
  if (complete) return "done";
  if (!range) return "ahead";
  if (range.end && now > range.end) return "behind";
  if (now >= range.start) return "current";
  return "ahead";
}

export type NeedsFollowUp = "behind_pace" | "no_progress" | "launch_approaching" | "on_track";

export const needsFollowUpLabel: Record<NeedsFollowUp, string> = {
  behind_pace: "Behind Pace",
  no_progress: "No Progress",
  launch_approaching: "Launch Approaching",
  on_track: "On Track",
};

/** Days of inactivity before flagging No Progress. Not yet author-configurable — a sensible default. */
const NO_PROGRESS_DAYS = 14;
/** Days out from the target date before flagging Launch Approaching. */
const LAUNCH_APPROACHING_DAYS = 30;

/**
 * The cycle-health signal from Functionality Spec §3.7. Priority order (first match wins):
 * Behind Pace -> No Progress -> Launch Approaching -> On Track.
 */
export function needsFollowUp(input: {
  phases: { range: PhaseRange | undefined; complete: boolean }[];
  lastActivityAt: Date | null;
  targetDate: Date | null;
  /** A finished or formally closed cycle never needs follow-up. */
  cycleComplete?: boolean;
  now?: Date;
}): NeedsFollowUp {
  const now = input.now ?? new Date();

  if (input.cycleComplete) return "on_track";


  if (input.phases.some((phase) => pacing(phase.range, phase.complete, now) === "behind")) return "behind_pace";

  if (input.lastActivityAt) {
    const daysSinceActivity = Math.floor((now.getTime() - input.lastActivityAt.getTime()) / day);
    if (daysSinceActivity >= NO_PROGRESS_DAYS) return "no_progress";
  }

  if (input.targetDate) {
    const daysUntilTarget = Math.floor((input.targetDate.getTime() - now.getTime()) / day);
    if (daysUntilTarget >= 0 && daysUntilTarget <= LAUNCH_APPROACHING_DAYS) return "launch_approaching";
  }

  return "on_track";
}
