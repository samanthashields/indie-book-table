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
import { WishlistBar } from "@/components/site/wishlist-bar";
import { SubscribeGateModal } from "@/components/site/subscribe-gate-modal";
import { useWishlist, useWishlistGate, type WishlistEntry } from "@/lib/wishlist";

type FlyerPageSpec =
  | { kind: "cover"; label: string }
  | { kind: "category"; label: string; category: string; books: CatalogBook[] }
  | { kind: "spotlight"; label: string; category: string; book: CatalogBook };

/** The flip-book: one published issue rendered as page-turning flyer sheets. */
export function FlyerReader({ data }: { data: CatalogIssue }) {
  const [pageIndex, setPageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const { entries, toggle, clear, isCircled } = useWishlist();
  const { unlocked, unlock } = useWishlistGate();
  const [gateOpen, setGateOpen] = useState(false);
  const pendingCircle = useRef<WishlistEntry | null>(null);

  /** Circling is a subscriber perk: the first tap opens the sign-up coupon. */
  const handleCircle = useCallback(
    (entry: WishlistEntry) => {
      if (!unlocked) {
        pendingCircle.current = entry;
        setGateOpen(true);
        return;
      }
      toggle(entry);
    },
    [toggle, unlocked],
  );

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
        {...(page.kind === "cover"
          ? {}
          : {
              runningHead: page.kind === "spotlight" ? `Spotlight — ${page.category}` : page.category,
              folio: `Page ${index + 1} of ${total}`,
            })}
        corner={<CornerTurn onNext={goNext} disabled={index >= total - 1} />}
      >
        {page.kind === "cover" && (
          <div className="flex min-h-[min(70rem,calc(100vh-14rem))] flex-col justify-center">
            <div className="poster-slant rounded-2xl bg-cocoa py-4 text-center">
              <p className="poster-unslant font-serif text-[2.6rem] font-black uppercase leading-none tracking-[0.1em] text-paper sm:text-[4.5rem]">
                The Indie Table
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-full bg-card/80 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-inkblue">
              <span>{data.issue?.display_label ?? "Current"} issue</span>
              <span>{allBooks.length} titles</span>
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
                    {pages.slice(1).map((entry, i) => (
                      <li key={`${entry.label}-${i}`} className="flex items-baseline justify-between gap-3 border-b border-dashed border-cocoa/25 pb-1">
                        <span className="truncate font-semibold">{entry.label}</span>
                        <span className="text-[0.65rem] font-bold tracking-[0.14em] text-cocoa/60">{i + 2}</span>
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
                  {pages.slice(1).map((entry, i) => (
                    <li key={`${entry.label}-${i}`} className="flex items-baseline justify-between gap-3 border-b border-dashed border-cocoa/25 pb-1">
                      <span className="truncate font-semibold">{entry.label}</span>
                      <span className="text-[0.65rem] font-bold tracking-[0.14em] text-cocoa/60">{i + 2}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

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
              <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {page.books.map((book) => (
                  <div key={book.id}>
                    <ListingRow
                      book={book}
                      listingNumber={listingNumbers.get(book.id)}
                      circled={isCircled(book.id)}
                      onCircle={handleCircle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {page.kind === "spotlight" && (
          <SpotlightFeature
            book={page.book}
            category={page.category}
            circled={isCircled(page.book.id)}
            onCircle={handleCircle}
          />
        )}
      </FlyerPage>
    );
  };

  return (
    <div className="min-h-screen bg-paper/60">
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

        <WishlistBar entries={entries} onClear={clear} />
      </div>

      <SubscribeGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        onSubscribed={() => {
          unlock();
          setGateOpen(false);
          if (pendingCircle.current) {
            toggle(pendingCircle.current);
            pendingCircle.current = null;
          }
        }}
      />
    </div>
  );
}
