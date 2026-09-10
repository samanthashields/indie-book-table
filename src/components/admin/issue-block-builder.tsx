import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FlyerReader } from "@/components/site/flyer/flyer-reader";
import { getIssuePreview } from "@/lib/catalog.functions";
import { saveIssueBlocks, useIssueBlocks } from "@/lib/catalog-admin";
import { buildPages } from "@/lib/flyer-blocks";
import type { CatalogBook, FlyerBlockKind, StoredFlyerBlock } from "@/lib/catalog-types";

const BLOCK_LABELS: Record<FlyerBlockKind, string> = {
  cover: "Issue cover",
  sectionBanner: "Add a section",
  hero: "Feature this book",
  grid: "A row of books",
  fanOut: "Fan out an author’s books",
  authorSpotlight: "Add an author spotlight",
  personality: "Notes from the team",
};

const ACCENTS = ["lime", "red", "yellow", "sky", "pink", "purple", "orange", "teal"] as const;
const SHAPES = ["rounded", "torn", "ribbon"] as const;
const SHAPE_LABELS: Record<string, string> = {
  rounded: "Rounded panel",
  torn: "Torn paper edge",
  ribbon: "Angled ribbon",
};

let tempId = 0;
const newBlock = (kind: FlyerBlockKind, position: number): StoredFlyerBlock => ({
  id: `new-${(tempId += 1)}`,
  kind,
  position,
  config: kind === "personality" ? { heading: "Notes from the team", body: "" } : {},
});

const selectClass =
  "mt-1 h-9 w-full rounded-xl border border-input bg-paper px-3 text-sm";

/** Lightweight page builder: an ordered list of blocks with a live preview. */
export function IssueBlockBuilder({ issueId }: { issueId: string }) {
  const queryClient = useQueryClient();
  const saved = useIssueBlocks(issueId);
  const preview = useServerFn(getIssuePreview);
  const issue = useQuery({
    queryKey: ["catalog-admin", "issue-preview", issueId],
    queryFn: () => preview({ data: { issueId } }),
  });

  const [blocks, setBlocks] = useState<StoredFlyerBlock[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (saved.data) {
      setBlocks(saved.data);
      setDirty(false);
    }
  }, [saved.data]);

  const books = useMemo<CatalogBook[]>(
    () => (issue.data?.categories ?? []).flatMap((group) => group.books),
    [issue.data],
  );
  const authors = useMemo(() => {
    const map = new Map<string, string>();
    for (const book of books) map.set(book.author_id, book.author_name);
    return [...map.entries()];
  }, [books]);

  const update = (index: number, patch: Partial<StoredFlyerBlock["config"]>) => {
    setDirty(true);
    setBlocks((list) =>
      list.map((block, i) => (i === index ? { ...block, config: { ...block.config, ...patch } } : block)),
    );
  };
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    setDirty(true);
    setBlocks((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return next;
    });
  };
  const add = (kind: FlyerBlockKind) => {
    setDirty(true);
    setBlocks((list) => [...list, newBlock(kind, list.length)]);
  };

  const previewData = issue.data ? { ...issue.data, blocks } : null;
  const startFromLineup = () => {
    if (!issue.data) return;
    const derived: StoredFlyerBlock[] = [];
    for (const page of buildPages({ ...issue.data, blocks: [] })) {
      for (const block of page.blocks) {
        switch (block.type) {
          case "cover":
            derived.push(newBlock("cover", derived.length));
            break;
          case "sectionBanner":
            derived.push({ ...newBlock("sectionBanner", derived.length), config: { title: block.category } });
            break;
          case "hero":
            derived.push({ ...newBlock("hero", derived.length), config: { bookId: block.book.id } });
            break;
          case "grid":
            derived.push({
              ...newBlock("grid", derived.length),
              config: { bookIds: block.books.map((book) => book.id) },
            });
            break;
          case "fanOut":
            derived.push({
              ...newBlock("fanOut", derived.length),
              config: { bookIds: block.books.map((book) => book.id) },
            });
            break;
          case "authorSpotlight":
            derived.push({
              ...newBlock("authorSpotlight", derived.length),
              config: { authorId: block.authorId },
            });
            break;
          default:
            break;
        }
      }
    }
    setBlocks(derived);
    setDirty(true);
  };

  const save = async () => {
    try {
      await saveIssueBlocks(issueId, blocks);
      setDirty(false);
      toast.success(blocks.length === 0 ? "Layout cleared — the flyer builds itself again" : "Layout saved");
      void queryClient.invalidateQueries({ queryKey: ["catalog-admin", "issue-blocks", issueId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That didn’t save");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-normal">Flyer pages</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrange the pages of this issue. With no blocks here the flyer lays itself out from the lineup.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={startFromLineup} disabled={!issue.data}>
            Start from the lineup
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setBlocks([]);
              setDirty(true);
            }}
          >
            Clear
          </Button>
          <Button onClick={() => void save()} disabled={!dirty}>
            Save layout
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="space-y-3">
          {blocks.length === 0 && (
            <p className="rounded-xl bg-paper p-4 text-sm text-muted-foreground">
              No pages arranged yet.
            </p>
          )}

          {blocks.map((block, index) => (
            <div key={block.id} className="rounded-xl border border-border bg-paper p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {index + 1}. {BLOCK_LABELS[block.kind]}
                </p>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => move(index, -1)}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => move(index, 1)}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Duplicate"
                    onClick={() => {
                      setDirty(true);
                      setBlocks((list) => [
                        ...list.slice(0, index + 1),
                        { ...block, id: `new-${(tempId += 1)}` },
                        ...list.slice(index + 1),
                      ]);
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove"
                    onClick={() => {
                      setDirty(true);
                      setBlocks((list) => list.filter((_, i) => i !== index));
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {block.kind === "sectionBanner" && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Section name
                    <Input
                      className="mt-1"
                      value={block.config.title ?? ""}
                      onChange={(event) => update(index, { title: event.target.value })}
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Colour
                      <select
                        className={selectClass}
                        value={block.config.accent ?? ""}
                        onChange={(event) => update(index, { accent: event.target.value || null })}
                      >
                        <option value="">Automatic</option>
                        {ACCENTS.map((accent) => (
                          <option key={accent} value={accent}>
                            {accent}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Banner shape
                      <select
                        className={selectClass}
                        value={block.config.shape ?? ""}
                        onChange={(event) => update(index, { shape: event.target.value || null })}
                      >
                        <option value="">Automatic</option>
                        {SHAPES.map((shape) => (
                          <option key={shape} value={shape}>
                            {SHAPE_LABELS[shape]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {block.kind === "hero" && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Book
                    <select
                      className={selectClass}
                      value={block.config.bookId ?? ""}
                      onChange={(event) => update(index, { bookId: event.target.value || null })}
                    >
                      <option value="">Pick a book</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} — {book.author_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Hook line (optional)
                    <Textarea
                      className="mt-1"
                      rows={2}
                      value={block.config.hook ?? ""}
                      onChange={(event) => update(index, { hook: event.target.value })}
                    />
                  </label>
                </div>
              )}

              {(block.kind === "grid" || block.kind === "fanOut") && (
                <div className="mt-3 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Books</p>
                  <div className="space-y-1">
                    {books.map((book) => {
                      const chosen = (block.config.bookIds ?? []).includes(book.id);
                      return (
                        <label key={book.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={chosen}
                            onChange={() =>
                              update(index, {
                                bookIds: chosen
                                  ? (block.config.bookIds ?? []).filter((id) => id !== book.id)
                                  : [...(block.config.bookIds ?? []), book.id],
                              })
                            }
                          />
                          {book.title} — {book.author_name}
                        </label>
                      );
                    })}
                  </div>
                  {block.kind === "grid" && (
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Show one larger
                      <select
                        className={selectClass}
                        value={block.config.featuredBookId ?? ""}
                        onChange={(event) => update(index, { featuredBookId: event.target.value || null })}
                      >
                        <option value="">All the same size</option>
                        {(block.config.bookIds ?? []).map((id) => (
                          <option key={id} value={id}>
                            {books.find((book) => book.id === id)?.title ?? id}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {block.kind === "fanOut" && (
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Heading (optional)
                      <Input
                        className="mt-1"
                        value={block.config.heading ?? ""}
                        onChange={(event) => update(index, { heading: event.target.value })}
                      />
                    </label>
                  )}
                </div>
              )}

              {block.kind === "authorSpotlight" && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Author
                    <select
                      className={selectClass}
                      value={block.config.authorId ?? ""}
                      onChange={(event) => update(index, { authorId: event.target.value || null })}
                    >
                      <option value="">Pick an author</option>
                      {authors.map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Blurb (optional — their profile bio is used otherwise)
                    <Textarea
                      className="mt-1"
                      rows={3}
                      value={block.config.body ?? ""}
                      onChange={(event) => update(index, { body: event.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Photo web address (optional)
                    <Input
                      className="mt-1"
                      value={block.config.imageUrl ?? ""}
                      onChange={(event) => update(index, { imageUrl: event.target.value })}
                    />
                  </label>
                </div>
              )}

              {block.kind === "personality" && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Heading
                    <Input
                      className="mt-1"
                      value={block.config.heading ?? ""}
                      onChange={(event) => update(index, { heading: event.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Message
                    <Textarea
                      className="mt-1"
                      rows={4}
                      value={block.config.body ?? ""}
                      onChange={(event) => update(index, { body: event.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Illustration web address (optional)
                    <Input
                      className="mt-1"
                      value={block.config.imageUrl ?? ""}
                      onChange={(event) => update(index, { imageUrl: event.target.value })}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold">Add a page piece</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(BLOCK_LABELS) as FlyerBlockKind[]).map((kind) => (
                <Button key={kind} size="sm" variant="outline" onClick={() => add(kind)}>
                  {BLOCK_LABELS[kind]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Live preview
          </p>
          {previewData ? (
            <div className="max-h-[46rem] overflow-auto rounded-xl bg-background">
              <FlyerReader data={previewData} />
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Loading the preview…</p>
          )}
        </div>
      </div>
    </div>
  );
}
