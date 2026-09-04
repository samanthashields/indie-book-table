export type ManuscriptStatus = "drafting" | "first_draft_done" | "edited";

export type PhaseKey = "writing" | "editing" | "production" | "prelaunch" | "launch" | "growth";

const WEIGHTS: Record<"writing" | "editing" | "production" | "prelaunch", number> = {
  writing: 0.356,
  editing: 0.171,
  production: 0.171,
  prelaunch: 0.302,
};

const ACTIVE_FROM: Record<ManuscriptStatus, (keyof typeof WEIGHTS)[]> = {
  drafting: ["writing", "editing", "production", "prelaunch"],
  first_draft_done: ["editing", "production", "prelaunch"],
  edited: ["production", "prelaunch"],
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
    writing: 21,
    editing: 21,
    production: illustrated ? 90 : 30,
    prelaunch: 60,
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
  ranges.growth = { start: addDays(pub, 22), end: null, fixed: true };

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
