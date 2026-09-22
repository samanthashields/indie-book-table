import { CalendarRange, CheckCircle2, Sparkles } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { CHALLENGE_METRIC_LABELS, isCurrentMonth, monthLabel, type ChallengeMetric, type ChallengeProgress } from "@/lib/challenges";
import { DECORATIONS, isDecorationKey } from "@/lib/decorations";
import { cn } from "@/lib/utils";

function ChallengeCard({ challenge }: { challenge: ChallengeProgress }) {
  const metricLabel = CHALLENGE_METRIC_LABELS[challenge.metric as ChallengeMetric] ?? challenge.metric;
  const decoration = isDecorationKey(challenge.decorationKey) ? DECORATIONS[challenge.decorationKey] : null;
  const pct = Math.min(100, Math.round((challenge.count / Math.max(challenge.target, 1)) * 100));

  return (
    <li className={cn("rounded-2xl border p-5 shadow-xs", challenge.completed ? "border-primary/30 bg-card" : "border-border bg-card")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-xl font-normal">{challenge.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarRange className="size-3.5" />{monthLabel(challenge.challengeMonth)}</p>
        </div>
        {decoration && (
          <img src={decoration.image} alt={decoration.label} width={512} height={512} loading="lazy" className={cn("size-14 object-contain", challenge.completed ? "" : "opacity-35 grayscale")} />
        )}
      </div>
      {challenge.blurb && <p className="mt-3 text-sm leading-6 text-muted-foreground">{challenge.blurb}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Progress value={pct} className="h-1.5" />
        <span className="shrink-0 text-xs font-semibold">{Math.min(challenge.count, challenge.target)} of {challenge.target}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{metricLabel}</p>
      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
        {challenge.completed ? (
          <><CheckCircle2 className="size-4 text-link" />Complete — {decoration?.label ?? "decoration"} added to your table</>
        ) : (
          <><Sparkles className="size-4 text-amber" />Unlocks the {decoration?.label.toLowerCase() ?? "decoration"}</>
        )}
      </p>
    </li>
  );
}

export function ChallengeList({ challenges }: { challenges: ChallengeProgress[] }) {
  const running = challenges.filter((row) => isCurrentMonth(row.challengeMonth));
  const earned = challenges.filter((row) => !isCurrentMonth(row.challengeMonth) && row.completed);

  return (
    <section aria-label="Seasonal challenges">
      <h2 className="font-heading text-2xl font-semibold">Challenges this month</h2>
      {running.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-paper p-6 text-sm text-muted-foreground">
          No challenge is running this month. New ones appear here when they open.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {running.map((row) => <ChallengeCard key={row.id} challenge={row} />)}
        </ul>
      )}

      {earned.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-paper p-4">
          <p className="text-sm font-semibold">Earned earlier</p>
          <ul className="mt-3 flex flex-wrap gap-4">
            {earned.map((row) => (
              <li key={row.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                {isDecorationKey(row.decorationKey) && (
                  <img src={DECORATIONS[row.decorationKey].image} alt="" width={512} height={512} loading="lazy" className="size-8 object-contain" />
                )}
                <span>{row.title} · {monthLabel(row.challengeMonth)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
