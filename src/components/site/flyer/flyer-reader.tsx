import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CatalogIssue } from "@/lib/catalog-types";
import { normalizeIssueTheme, resolvePage } from "@/lib/flyer-theme";
import { buildPages } from "@/lib/flyer-blocks";
import { FlyerPage } from "./flyer-page";
import { PageTurner } from "./page-turner";
import { PageNav, CornerTurn } from "./page-nav";
import { CoverBlock } from "./blocks/cover-block";
import { SectionBanner } from "./blocks/section-banner";
import { HeroBlock } from "./blocks/hero-block";
import { GridBlock } from "./blocks/grid-block";
import { FanOutBlock } from "./blocks/fan-out-block";
import { AuthorBlock } from "./blocks/author-block";
import { WishlistBar } from "@/components/site/wishlist-bar";
import { SubscribeGateModal } from "@/components/site/subscribe-gate-modal";
import { useWishlist, useWishlistGate, type WishlistEntry } from "@/lib/wishlist";

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

  const pages = useMemo(() => buildPages(data), [data]);

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

    const look = resolvePage(theme, pageThemes, page.category, index);
    const isCover = page.category === null && page.blocks.some((block) => block.type === "cover");

    return (
      <FlyerPage
        groundClass={look.ground}
        accent={look.accent}
        pattern={look.pattern}
        backgroundImage={look.backgroundImage}
        {...(isCover
          ? {}
          : {
              runningHead: page.label,
              folio: `Page ${index + 1} of ${total}`,
            })}
        corner={<CornerTurn onNext={goNext} disabled={index >= total - 1} />}
      >
        {page.blocks.map((block, blockIndex) => {
          switch (block.type) {
            case "cover":
              return (
                <CoverBlock
                  key={blockIndex}
                  data={data}
                  theme={theme}
                  bookCount={allBooks.length}
                  toc={pages.slice(1).map((entry, i) => ({ label: entry.label, page: i + 2 }))}
                />
              );
            case "sectionBanner":
              return <SectionBanner
                  key={blockIndex}
                  category={block.category}
                  {...(typeof block.count === "number" ? { count: block.count } : {})}
                  {...(block.accent ? { accent: block.accent } : {})}
                  {...(block.shape ? { shape: block.shape } : {})}
                />;
            case "hero":
              return (
                <div key={blockIndex} className={blockIndex > 0 ? "mt-6" : undefined}>
                  <HeroBlock
                    book={block.book}
                    category={block.category}
                    circled={isCircled(block.book.id)}
                    onCircle={handleCircle}
                  />
                </div>
              );
            case "grid":
              return (
                <GridBlock
                  key={blockIndex}
                  books={block.books}
                  listingNumbers={listingNumbers}
                  isCircled={isCircled}
                  onCircle={handleCircle}
                  doodleSeed={index}
                />
              );
            case "fanOut":
              return (
                <FanOutBlock
                  key={blockIndex}
                  authorId={block.authorId}
                  authorName={block.authorName}
                  books={block.books}
                  isCircled={isCircled}
                  onCircle={handleCircle}
                />
              );
            case "authorSpotlight":
              return (
                <AuthorBlock
                  key={blockIndex}
                  authorId={block.authorId}
                  authorName={block.authorName}
                  bio={block.bio}
                  books={block.books}
                />
              );
            case "personality":
              return null;
          }
        })}
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
