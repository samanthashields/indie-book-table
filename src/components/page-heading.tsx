import type { ReactNode } from "react";

export function PageHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-9 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border/70 pb-7"><div className="min-w-0"><h1 className="font-serif text-4xl font-normal leading-tight md:text-5xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}</div><div className="shrink-0">{action}</div></div>;
}
