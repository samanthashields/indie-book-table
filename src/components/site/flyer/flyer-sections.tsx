import { useMemo } from "react";

import type { CatalogIssue } from "@/lib/catalog-types";
import { normalizeIssueTheme, resolvePage } from "@/lib/flyer-theme";
import { buildPages } from "@/lib/flyer-blocks";
import type { WishlistEntry } from "@/lib/wishlist";
import { FlyerPage } from "./flyer-page";
import { CoverBlock } from "./blocks/cover-block";
import { SectionBanner } from "./blocks/section-banner";
import { HeroBlock } from "./blocks/hero-block";
import { GridBlock } from "./blocks/grid-block";
import { FanOutBlock } from "./blocks/fan-out-block";
import { AuthorBlock } from "./blocks/author-block";
import { PersonalityBlock } from "./blocks/personality-block";

/**
 * The issue's content: either the admin-uploaded PDF, or the block-built
 * sections (skipping the cover block when the host page already shows its
 * own title/tagline header — see `skipCover`).
 */
export function FlyerSections({
  data,
  isCircled,
  onCircle,
  skipCover = false,
}: {
  data: CatalogIssue;
  isCircled: (bookId: string) => boolean;
  onCircle: (entry: WishlistEntry) => void;
  skipCover?: boolean;
}) {
  const allBooks = useMemo(() => data.categories.flatMap((category) => category.books), [data.categories]);

  /** Order-form style listing numbers, stable across the whole issue. */
  const listingNumbers = useMemo(() => {
    const map = new Map<string, number>();
    allBooks.forEach((book, index) => map.set(book.id, index + 1));
    return map;
  }, [allBooks]);

  const sections = useMemo(() => buildPages(data), [data]);
  const shown = skipCover ? sections.filter((section) => !section.blocks.some((block) => block.type === "cover")) : sections;

  const theme = normalizeIssueTheme(data.theme);
  const pageThemes = data.pageThemes ?? [];
  const pdfUrl = theme.pdf_url;

  const renderSection = (index: number) => {
    const section = shown[index];
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
                  toc={shown.slice(1).map((entry, i) => ({ label: entry.label, anchor: `section-${i + 1}` }))}
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
                    onCircle={onCircle}
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
                  onCircle={onCircle}
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
                  onCircle={onCircle}
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

  if (pdfUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card">
        <iframe
          title={`${data.issue?.display_label ?? "Issue"} PDF`}
          src={pdfUrl}
          className="h-[min(90vh,60rem)] w-full"
        />
      </div>
    );
  }

  if (shown.length === 0) {
    return (
      <FlyerPage>
        <p className="py-24 text-center text-cocoa/70">No issue is published yet. Check back at the start of the month.</p>
      </FlyerPage>
    );
  }

  return <div className="space-y-8">{shown.map((_, index) => renderSection(index))}</div>;
}
