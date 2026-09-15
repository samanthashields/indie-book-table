import { cn } from "@/lib/utils";

/** A floating open book circled by a cycle arc — the Pen mark used in the create-flow. */
export function CoachMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={cn("size-6", className)}>
      <path
        d="M40.5 15.5a19 19 0 1 1-8-8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M35 5.5v8h-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path
        d="M24 19.6c-2.3-2-5-2.9-8.2-2.9-1.1 0-2 .9-2 2v9.7c0 1.1.9 2 2 2 3.2 0 5.9.9 8.2 2.9 2.3-2 5-2.9 8.2-2.9 1.1 0 2-.9 2-2v-9.7c0-1.1-.9-2-2-2-3.2 0-5.9.9-8.2 2.9Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 19.6v13.7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M15 37.5c3.4 0 6.4.9 9 2.6 2.6-1.7 5.6-2.6 9-2.6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}
