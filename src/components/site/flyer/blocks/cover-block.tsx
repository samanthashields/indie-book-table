import type { CatalogIssue } from "@/lib/catalog-types";
import type { FlyerIssueTheme } from "@/lib/flyer-theme";
import { IconLegend } from "../tag-chips";

/** The issue's front page: masthead, headline, cover art or table of contents. */
export function CoverBlock({
  data,
  theme,
  bookCount,
  toc,
}: {
  data: CatalogIssue;
  theme: FlyerIssueTheme;
  bookCount: number;
  toc: { label: string; page: number }[];
}) {
  return (
    <div className="flex min-h-[min(70rem,calc(100vh-14rem))] flex-col justify-center">
      <div className="poster-slant rounded-2xl bg-cocoa py-4 text-center">
        <p className="poster-unslant font-serif text-[2.1rem] font-black uppercase leading-none tracking-[0.08em] text-paper sm:text-[3.4rem]">
          The Indie Book Table
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-full bg-card/80 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-inkblue">
        <span>{data.issue?.display_label ?? "Current"} issue</span>
        <span>{bookCount} titles</span>
        <span className="hidden sm:inline">Independently published</span>
      </div>

      <div className="mt-8 grid items-center gap-8 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="text-left">
          <h1 className="font-serif text-5xl leading-[0.95] text-cocoa sm:text-7xl">
            {theme.cover_headline ?? data.issue?.display_label ?? "The Table"}
          </h1>
          <p className="mt-5 max-w-md font-serif text-lg italic leading-relaxed text-cocoa/80">
            {theme.cover_tagline ??
              "A hand-curated flyer of independently published books. Flip through and find your next read."}
          </p>
          <p className="mt-6 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-clay">
            Turn the page to start browsing →
          </p>
        </div>
        {theme.cover_image_url ? (
          <figure className="poster-panel bg-card p-3">
            <img
              src={theme.cover_image_url}
              alt={`Cover art for the ${data.issue?.display_label ?? "current"} issue`}
              className="mx-auto max-h-[22rem] w-full object-cover"
            />
          </figure>
        ) : (
          <div className="poster-panel bg-card p-6">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cocoa/70">In this issue</p>
            <ol className="mt-3 space-y-1.5 text-sm text-cocoa/85">
              {toc.map((entry) => (
                <li
                  key={`${entry.label}-${entry.page}`}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-cocoa/25 pb-1"
                >
                  <span className="truncate font-semibold">{entry.label}</span>
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] text-cocoa/60">{entry.page}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {theme.cover_image_url && (
        <div className="poster-panel mt-8 bg-card p-5">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cocoa/70">In this issue</p>
          <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-cocoa/85 sm:grid-cols-2">
            {toc.map((entry) => (
              <li
                key={`${entry.label}-${entry.page}`}
                className="flex items-baseline justify-between gap-3 border-b border-dashed border-cocoa/25 pb-1"
              >
                <span className="truncate font-semibold">{entry.label}</span>
                <span className="text-[0.65rem] font-bold tracking-[0.14em] text-cocoa/60">{entry.page}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-8">
        <IconLegend />
      </div>
    </div>
  );
}
