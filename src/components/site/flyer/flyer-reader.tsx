import { Link } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import type { CatalogIssue } from "@/lib/catalog-types";
import { normalizeIssueTheme, resolvePage } from "@/lib/flyer-theme";
import { buildPages } from "@/lib/flyer-blocks";
import { FlyerPage } from "./flyer-page";
import { CoverBlock } from "./blocks/cover-block";
import { SectionBanner } from "./blocks/section-banner";
import { HeroBlock } from "./blocks/hero-block";
import { GridBlock } from "./blocks/grid-block";
import { FanOutBlock } from "./blocks/fan-out-block";
import { AuthorBlock } from "./blocks/author-block";
import { PersonalityBlock } from "./blocks/personality-block";
import { WishlistBar } from "@/components/site/wishlist-bar";
import { SubscribeGateModal } from "@/components/site/subscribe-gate-modal";
import { useWishlist, useWishlistGate, type WishlistEntry } from "@/lib/wishlist";

/** The issue's public page: every section stacked in one long scroll, no page-turning. */
export function FlyerReader({ data }: { data: CatalogIssue }) {
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

  // Every block flows in one scroll — no per-screen pagination budget.
  const sections = useMemo(() => buildPages(data), [data]);

  const theme = normalizeIssueTheme(data.theme);
  const pageThemes = data.pageThemes ?? [];
  const pdfUrl = theme.pdf_url;

  const renderSection = (index: number) => {
    const section = sections[index];
    if (!section) return null;

    const look = resolvePage(theme, pageThemes, section.category, index);
    const isCover = section.category === null && section.blocks.some((block) => block.type === "cover");

    return (
      <FlyerPage
        key={index}
        id={`section-${index}`}
        groundClass={look.ground}
        accent={look.accent}
        pattern={look.pattern}
        backgroundImage={look.backgroundImage}
        {...(isCover ? {} : { runningHead: section.label })}
      >
        {section.blocks.map((block, blockIndex) => {
          switch (block.type) {
            case "cover":
              return (
                <CoverBlock
                  key={blockIndex}
                  data={data}
                  theme={theme}
                  bookCount={allBooks.length}
                  toc={sections.slice(1).map((entry, i) => ({ label: entry.label, anchor: `section-${i + 1}` }))}
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
                    {...(block.hook ? { hook: block.hook } : {})}
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
                  compact={block.compact ?? false}
                  {...(block.featuredBookId ? { featuredBookId: block.featuredBookId } : {})}
                />
              );
            case "fanOut":
              return (
                <FanOutBlock
                  key={blockIndex}
                  authorId={block.authorId}
                  authorName={block.authorName}
                  {...(block.heading ? { heading: block.heading } : {})}
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
                  {...(block.photoUrl ? { photoUrl: block.photoUrl } : {})}
                  books={block.books}
                />
              );
            case "personality":
              return (
                <PersonalityBlock
                  key={blockIndex}
                  heading={block.heading}
                  body={block.body}
                  {...(block.imageUrl ? { imageUrl: block.imageUrl } : {})}
                />
              );
          }
        })}
      </FlyerPage>
    );
  };

  return (
    <div className="min-h-screen bg-paper/60">
      <div className="mx-auto max-w-5xl px-3 pb-16 pt-6 sm:px-6 sm:pt-10">
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

        {pdfUrl ? (
          <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card">
            <iframe
              title={`${data.issue?.display_label ?? "Issue"} flyer PDF`}
              src={pdfUrl}
              className="h-[min(90vh,60rem)] w-full"
            />
          </div>
        ) : sections.length === 0 ? (
          <FlyerPage>
            <p className="py-24 text-center text-cocoa/70">
              No issue is published yet. Check back at the start of the month.
            </p>
          </FlyerPage>
        ) : (
          <div className="space-y-8">{sections.map((_, index) => renderSection(index))}</div>
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
