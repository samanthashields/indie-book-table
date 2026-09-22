export type PhaseStyle = { marker: string; chip: string; dot: string };

const styles: Record<string, PhaseStyle> = {
  writing_development: { marker: "bg-inkblue text-primary-foreground border-inkblue", chip: "border-inkblue/30 bg-inkblue/12 text-foreground", dot: "text-text-inkblue" },
  editing: { marker: "bg-teal text-ink border-teal", chip: "border-teal/40 bg-teal/18 text-foreground", dot: "text-text-teal" },
  production: { marker: "bg-leaf text-ink border-leaf", chip: "border-leaf/45 bg-leaf/20 text-foreground", dot: "text-text-leaf" },
  pre_launch: { marker: "bg-amber text-ink border-amber", chip: "border-amber/45 bg-amber/22 text-foreground", dot: "text-amber" },
  launch: { marker: "bg-clay text-primary-foreground border-clay", chip: "border-clay/40 bg-clay/15 text-foreground", dot: "text-text-clay" },
  post_launch_growth: { marker: "bg-inverse text-on-inverse border-inverse", chip: "border-cocoa/25 bg-cocoa/10 text-foreground", dot: "text-cocoa" },
};

const fallback: PhaseStyle = styles["writing_development"]!;

export const phaseStyle = (id: string): PhaseStyle => styles[id] ?? fallback;
