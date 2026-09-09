import type { CatalogBook, CatalogIssue } from "./catalog-types";

/**
 * The flyer is built from blocks. `buildPages` derives the block list from an
 * issue's existing selections so every issue — old or new — renders through
 * the same layout system. A later admin builder will persist an explicit
 * block list per issue; this deriver stays as the fallback.
 */
export type FlyerBlock =
  | { type: "cover" }
  | { type: "sectionBanner"; category: string; count: number }
  | { type: "hero"; book: CatalogBook; category: string }
  | { type: "grid"; category: string; books: CatalogBook[] }
  | { type: "fanOut"; category: string; authorId: string; authorName: string; books: CatalogBook[] }
  | {
      type: "authorSpotlight";
      authorId: string;
      authorName: string;
      bio: string | null;
      books: CatalogBook[];
    }
  | { type: "personality"; heading: string; body: string };

/** One turnable flyer sheet: an ordered set of blocks under a shared page look. */
export type FlyerBlockPage = {
  label: string;
  category: string | null;
  blocks: FlyerBlock[];
};

function contentBlock(category: string, books: CatalogBook[]): FlyerBlock {
  const first = books[0]!;
  if (books.length === 1) return { type: "hero", book: first, category };
  const sameAuthor = books.every((book) => book.author_id === first.author_id);
  if (sameAuthor) {
    return { type: "fanOut", category, authorId: first.author_id, authorName: first.author_name, books };
  }
  return { type: "grid", category, books };
}

export function buildPages(data: CatalogIssue): FlyerBlockPage[] {
  if (!data.issue || data.categories.length === 0) return [];

  const pages: FlyerBlockPage[] = [{ label: "Cover", category: null, blocks: [{ type: "cover" }] }];
  const authorBlocks = new Map<string, Extract<FlyerBlock, { type: "authorSpotlight" }>>();

  for (const { category, books } of data.categories) {
    if (books.length === 0) continue;
    const banner: FlyerBlock = { type: "sectionBanner", category, count: books.length };
    const spotlight = books.find((book) => book.is_spotlight);
    const rest = spotlight ? books.filter((book) => book.id !== spotlight.id) : books;

    if (books.length === 1 && books[0]) {
      // A single book never sits alone in a grid — it gets the hero treatment.
      pages.push({ label: category, category, blocks: [banner, { type: "hero", book: books[0], category }] });
    } else if (spotlight) {
      pages.push({
        label: `Spotlight — ${category}`,
        category,
        blocks: [banner, { type: "hero", book: spotlight, category }],
      });
      if (rest.length > 0) {
        pages.push({ label: category, category, blocks: [banner, contentBlock(category, rest)] });
      }
    } else {
      pages.push({ label: category, category, blocks: [banner, contentBlock(category, books)] });
    }

    // Authors with a bio earn a featured-author page at the back of the issue.
    for (const book of books) {
      if (!book.author_bio || !book.author_id) continue;
      const existing = authorBlocks.get(book.author_id);
      if (existing) {
        if (!existing.books.some((entry) => entry.id === book.id)) existing.books.push(book);
      } else {
        authorBlocks.set(book.author_id, {
          type: "authorSpotlight",
          authorId: book.author_id,
          authorName: book.author_name,
          bio: book.author_bio,
          books: [book],
        });
      }
    }
  }

  for (const block of authorBlocks.values()) {
    pages.push({ label: `Meet ${block.authorName}`, category: null, blocks: [block] });
  }

  return pages;
}
