import type { CatalogBook, CatalogIssue, StoredFlyerBlock } from "./catalog-types";
import type { BannerShape, FlyerColor } from "./flyer-theme";

/**
 * The flyer is built from blocks. `buildPages` derives the block list from an
 * issue's existing selections so every issue — old or new — renders through
 * the same layout system. A later admin builder will persist an explicit
 * block list per issue; this deriver stays as the fallback.
 */
export type FlyerBlock =
  | { type: "cover" }
  | {
      type: "sectionBanner";
      category: string;
      count?: number;
      accent?: FlyerColor;
      shape?: BannerShape;
    }
  | { type: "hero"; book: CatalogBook; category: string; hook?: string | null }
  | { type: "grid"; category: string; books: CatalogBook[]; featuredBookId?: string | null }
  | {
      type: "fanOut";
      category: string;
      authorId: string;
      authorName: string;
      heading?: string | null;
      books: CatalogBook[];
    }
  | {
      type: "authorSpotlight";
      authorId: string;
      authorName: string;
      bio: string | null;
      photoUrl?: string | null;
      books: CatalogBook[];
    }
  | { type: "personality"; heading: string; body: string; imageUrl?: string | null };

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

const ACCENTS: FlyerColor[] = ["lime", "red", "yellow", "sky", "pink", "purple", "orange", "teal"];
const SHAPES: BannerShape[] = ["rounded", "torn", "ribbon"];

const asAccent = (value?: string | null): FlyerColor | undefined =>
  value && (ACCENTS as string[]).includes(value) ? (value as FlyerColor) : undefined;
const asShape = (value?: string | null): BannerShape | undefined =>
  value && (SHAPES as string[]).includes(value) ? (value as BannerShape) : undefined;

/** Turns an editor's saved block list into turnable pages. */
export function pagesFromStoredBlocks(
  data: CatalogIssue,
  stored: StoredFlyerBlock[],
): FlyerBlockPage[] {
  const books = new Map<string, CatalogBook>();
  const categoryOf = new Map<string, string>();
  for (const group of data.categories) {
    for (const book of group.books) {
      books.set(book.id, book);
      categoryOf.set(book.id, group.category);
    }
  }
  const pick = (ids?: string[] | null) =>
    (ids ?? []).map((id) => books.get(id)).filter((book): book is CatalogBook => Boolean(book));
  const authorBooks = (authorId?: string | null) =>
    [...books.values()].filter((book) => book.author_id === authorId);

  const pages: FlyerBlockPage[] = [];
  let current: FlyerBlockPage | null = null;
  const startPage = (label: string, category: string | null) => {
    current = { label, category, blocks: [] };
    pages.push(current);
  };
  const push = (block: FlyerBlock, label?: string, category?: string | null) => {
    if (!current) startPage(label ?? "Page", category ?? null);
    current!.blocks.push(block);
  };

  for (const entry of [...stored].sort((a, b) => a.position - b.position)) {
    const config = entry.config ?? {};
    switch (entry.kind) {
      case "cover":
        startPage("Cover", null);
        push({ type: "cover" });
        break;
      case "sectionBanner": {
        const category = (config.title ?? "").trim() || "Section";
        startPage(category, category);
        push({
          type: "sectionBanner",
          category,
          accent: asAccent(config.accent),
          shape: asShape(config.shape),
        });
        break;
      }
      case "hero": {
        const book = config.bookId ? books.get(config.bookId) : undefined;
        if (!book) break;
        const category = current?.category ?? categoryOf.get(book.id) ?? "";
        push({ type: "hero", book, category, hook: config.hook ?? null }, book.title, category);
        break;
      }
      case "grid": {
        const list = pick(config.bookIds);
        if (list.length === 0) break;
        const category = current?.category ?? categoryOf.get(list[0]!.id) ?? "";
        push({ type: "grid", category, books: list, featuredBookId: config.featuredBookId ?? null }, category, category);
        break;
      }
      case "fanOut": {
        const list = pick(config.bookIds);
        if (list.length === 0) break;
        const first = list[0]!;
        const category = current?.category ?? categoryOf.get(first.id) ?? "";
        push(
          {
            type: "fanOut",
            category,
            authorId: first.author_id,
            authorName: first.author_name,
            heading: config.heading ?? null,
            books: list,
          },
          category,
          category,
        );
        break;
      }
      case "authorSpotlight": {
        const list = authorBooks(config.authorId);
        const first = list[0];
        if (!config.authorId || !first) break;
        startPage(`Meet ${first.author_name}`, null);
        push({
          type: "authorSpotlight",
          authorId: config.authorId,
          authorName: first.author_name,
          bio: config.body ?? first.author_bio ?? null,
          photoUrl: config.imageUrl ?? null,
          books: list,
        });
        break;
      }
      case "personality": {
        const heading = (config.heading ?? "Notes from the team").trim();
        startPage(heading, null);
        push({
          type: "personality",
          heading,
          body: config.body ?? "",
          imageUrl: config.imageUrl ?? null,
        });
        break;
      }
    }
  }

  return pages.filter((page) => page.blocks.length > 0);
}

export function buildPages(data: CatalogIssue): FlyerBlockPage[] {
  if (data.blocks && data.blocks.length > 0) {
    const pages = pagesFromStoredBlocks(data, data.blocks);
    if (pages.length > 0) return pages;
  }
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
