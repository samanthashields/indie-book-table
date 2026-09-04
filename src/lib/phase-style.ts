export type PhaseStyle = { marker: string; chip: string; dot: string; soft: string };

const styles: Record<string, PhaseStyle> = {
  writing: { marker: "bg-inkblue text-primary-foreground border-inkblue", chip: "border-inkblue/30 bg-inkblue/12 text-foreground", dot: "text-inkblue", soft: "bg-inkblue/8" },
  editing: { marker: "bg-teal text-cocoa border-teal", chip: "border-teal/40 bg-teal/18 text-foreground", dot: "text-teal", soft: "bg-teal/10" },
  production: { marker: "bg-leaf text-cocoa border-leaf", chip: "border-leaf/45 bg-leaf/20 text-foreground", dot: "text-leaf", soft: "bg-leaf/12" },
  prelaunch: { marker: "bg-amber text-cocoa border-amber", chip: "border-amber/45 bg-amber/22 text-foreground", dot: "text-amber", soft: "bg-amber/12" },
  launch: { marker: "bg-clay text-primary-foreground border-clay", chip: "border-clay/40 bg-clay/15 text-foreground", dot: "text-clay", soft: "bg-clay/10" },
  growth: { marker: "bg-cocoa text-paper border-cocoa", chip: "border-cocoa/25 bg-cocoa/10 text-foreground", dot: "text-cocoa", soft: "bg-paper" },
};

const fallback: PhaseStyle = styles.writing!;

export const phaseStyle = (id: string): PhaseStyle => styles[id] ?? fallback;
