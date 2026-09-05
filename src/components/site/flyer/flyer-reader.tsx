import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CatalogBook, CatalogIssue } from "@/lib/catalog-types";
import { normalizeIssueTheme, resolvePage } from "@/lib/flyer-theme";
import { FlyerPage } from "./flyer-page";
import { PageTurner } from "./page-turner";
import { PageNav, CornerTurn } from "./page-nav";
import { CategoryRibbon } from "./category-ribbon";
import { ListingRow } from "./listing-row";
import { SpotlightFeature } from "./spotlight-feature";
import { IconLegend } from "./tag-chips";
import { Doodles } from "./doodles";

type FlyerPageSpec =
  | { kind: "cover"; label: string }
  | { kind: "category"; label: string; category: string; books: CatalogBook[] }
  | { kind: "spotlight"; label: string; category: string; book: CatalogBook };

/** The flip-book: one published issue rendered as page-turning flyer sheets. */
export function FlyerReader({ data }: { data: CatalogIssue }) {
  const [pageIndex, setPageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const allBooks = useMemo(
    () => data.categories.flatMap((category) => category.books),
    [data.categories],
  );

  /** Order-form style listing numbers, stable across the whole issue. */
  const listingNumbers = useMemo(() => {
    const map = new Map<string, number>();
    allBooks.forEach((book, index) => map.set(book.id, index + 1));
    return map;
  }, [allBooks]);

  const pages = useMemo<FlyerPageSpec[]>(() => {
    if (!data.issue || data.categories.length === 0) return [];

    const list: FlyerPageSpec[] = [{ kind: "cover", label: "Cover" }];
    for (const category of data.categories) {
      list.push({
        kind: "category",
        label: category.category,
        category: category.category,
        books: category.books,
      });
    }

    for (const category of data.categories) {
      const featured = category.books.find((book) => book.is_spotlight);
      if (featured) {
        list.push({ kind: "spotlight", label: "Spotlight", category: category.category, book: featured });
      }
    }

    return list;
  }, [data.issue, data.categories]);

  const total = pages.length;
  const goNext = useCallback(
    () => setPageIndex((i) => Math.min(i + 1, Math.max(total - 1, 0))),
    [total],
  );
  const goPrev = useCallback(() => setPageIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const theme = normalizeIssueTheme(data.theme);
  const pageThemes = data.pageThemes ?? [];

  const renderPage = (index: number) => {
    const page = pages[index];
    if (!page) return null;

    const look = resolvePage(
      theme,
      pageThemes,
      page.kind === "cover" ? null : page.category,
      index,
    );

    return (
      <FlyerPage
        groundClass={look.ground}
        accent={look.accent}
        pattern={look.pattern}
        backgroundImage={look.backgroundImage}
      >
        {page.kind === "cover" && (
          <div className="flex min-h-[min(70rem,calc(100vh-14rem))] flex-col justify-center text-center">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.4em] text-inkblue">
              {data.issue?.display_label ?? "The Table"} Issue
            </p>
            {theme.cover_image_url && (
              <figure className="panel-outline mx-auto mt-6 max-w-md bg-card p-2">
                <img
                  src={theme.cover_image_url}
                  alt={`Cover art for the ${data.issue?.display_label ?? "current"} issue`}
                  className="mx-auto max-h-[20rem] w-auto object-contain"
                />
              </figure>
            )}
            <h1 className="mt-5 font-serif text-6xl leading-[0.95] text-cocoa sm:text-8xl">
              {theme.cover_headline ?? data.issue?.display_label ?? "The Table"}
            </h1>
            <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-cocoa/80">
              {theme.cover_tagline ??
                "A hand-curated flyer of independently published books. Flip through and find your next read."}
            </p>
            <p className="mt-8 -rotate-1 font-serif text-2xl italic text-clay">
              Turn the page to start browsing →
            </p>
            <div className="mt-8">
              <IconLegend />
            </div>
          </div>
        )}

        {page.kind === "category" && (
          <>
            <CategoryRibbon category={page.category} count={page.books.length} />
            <div className="relative mt-6">
              <Doodles seed={index} />
              <div className="relative grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {page.books.map((book) => (
                  <ListingRow
                    key={book.id}
                    book={book}
                    listingNumber={listingNumbers.get(book.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {page.kind === "spotlight" && (
          <SpotlightFeature book={page.book} category={page.category} />
        )}

        <CornerTurn onNext={goNext} disabled={index >= total - 1} />
      </FlyerPage>
    );
  };

  return (
    <div className="paper-grain min-h-screen bg-paper/60">
      <div
        className="mx-auto max-w-5xl px-3 pb-10 pt-6 sm:px-6 sm:pt-10"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 48) return;
          if (delta < 0) goNext();
          else goPrev();
        }}
      >
        <nav className="mb-4 text-sm text-cocoa/70">
          <Link to="/table" className="hover:text-cocoa hover:underline">
            The Table
          </Link>
          <span className="px-2">/</span>
          {data.issue && (
            <>
              <Link
                to="/table/$issueId"
                params={{ issueId: data.issue.id }}
                className="hover:text-cocoa hover:underline"
              >
                {data.issue.display_label}
              </Link>
              <span className="px-2">/</span>
            </>
          )}
          <span className="font-semibold text-cocoa">Flyer</span>
        </nav>

        {total === 0 ? (
          <FlyerPage>
            <p className="py-24 text-center text-cocoa/70">
              No issue is published yet. Check back at the start of the month.
            </p>
          </FlyerPage>
        ) : (
          <>
            <PageTurner index={pageIndex} renderPage={renderPage} />
            <PageNav
              index={pageIndex}
              total={total}
              onPrev={goPrev}
              onNext={goNext}
              onJump={setPageIndex}
              labels={pages.map((page, i) => `${i + 1}. ${page.label}`)}
            />
          </>
        )}
      </div>
    </div>
  );
}
