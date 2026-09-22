import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FlyerReader } from "@/components/site/flyer/flyer-reader";
import { getIssuePreview } from "@/lib/catalog.functions";
import { saveIssueBlocks, useIssueBlocks } from "@/lib/catalog-admin";
import { buildPages } from "@/lib/flyer-blocks";
import type { CatalogBook, FlyerBlockKind, StoredFlyerBlock } from "@/lib/catalog-types";
import { cn } from "@/lib/utils";

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

const selectClass = "mt-1 h-9 w-full rounded-xl border border-input bg-paper px-3 text-sm";
const fieldLabel = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/** One line describing what a block currently holds, for the outline list. */
function summaryFor(block: StoredFlyerBlock, books: CatalogBook[], authors: [string, string][]) {
  const titleOf = (id?: string | null) => books.find((book) => book.id === id)?.title;
  switch (block.kind) {
    case "cover":
      return "The front page";
    case "sectionBanner": {
      const bits = [
        (block.config.title ?? "").trim() || "Unnamed section",
        block.config.accent ?? null,
        block.config.shape ? SHAPE_LABELS[block.config.shape]?.toLowerCase() : null,
      ].filter(Boolean);
      return bits.join(" · ");
    }
    case "hero":
      return titleOf(block.config.bookId) ?? "No book chosen";
    case "grid":
    case "fanOut": {
      const count = (block.config.bookIds ?? []).length;
      const heading = block.kind === "fanOut" ? (block.config.heading ?? "").trim() : "";
      const label = `${count} ${count === 1 ? "book" : "books"}`;
      return heading ? `${heading} · ${label}` : label;
    }
    case "authorSpotlight":
      return authors.find(([id]) => id === block.config.authorId)?.[1] ?? "No author chosen";
    case "personality":
      return (block.config.heading ?? "").trim() || "Untitled note";
    default:
      return "";
  }
}

/** Block builder: an outline, one expanded editor, and a pinned live preview. */
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (saved.data) {
      setBlocks(saved.data);
      setDirty(false);
      setSelectedId(saved.data[0]?.id ?? null);
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

  const selectedIndex = blocks.findIndex((block) => block.id === selectedId);
  const selected = selectedIndex >= 0 ? blocks[selectedIndex] : undefined;

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
    const block = newBlock(kind, blocks.length);
    setBlocks((list) => [...list, block]);
    setSelectedId(block.id);
    setPicking(false);
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
    setSelectedId(derived[0]?.id ?? null);
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-heading text-2xl font-normal">Flyer pages</h3>
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
              setSelectedId(null);
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

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] 2xl:grid-cols-[17rem_minmax(0,1fr)_minmax(28rem,38%)]">
        {/* Outline */}
        <div className="space-y-2">
          {blocks.length === 0 && (
            <p className="rounded-xl bg-paper p-4 text-sm text-muted-foreground">No pages arranged yet.</p>
          )}

          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={cn(
                "rounded-xl border bg-paper p-3 transition-colors",
                block.id === selectedId ? "border-primary ring-1 ring-primary/40" : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedId(block.id)}
                className="block w-full text-left"
                aria-current={block.id === selectedId}
              >
                <p className="truncate text-sm font-semibold">
                  {index + 1}. {BLOCK_LABELS[block.kind]}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {summaryFor(block, books, authors)}
                </p>
              </button>
              <div className="mt-1 flex justify-end gap-0.5">
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
                    const copy = { ...block, id: `new-${(tempId += 1)}` };
                    setBlocks((list) => [...list.slice(0, index + 1), copy, ...list.slice(index + 1)]);
                    setSelectedId(copy.id);
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
                    if (block.id === selectedId) setSelectedId(null);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-border p-3">
            <Button size="sm" variant="outline" className="w-full" onClick={() => setPicking((open) => !open)}>
              <Plus className="size-4" /> Add a page piece
            </Button>
            {picking && (
              <div className="mt-3 flex flex-col gap-2">
                {(Object.keys(BLOCK_LABELS) as FlyerBlockKind[]).map((kind) => (
                  <Button key={kind} size="sm" variant="ghost" className="justify-start" onClick={() => add(kind)}>
                    {BLOCK_LABELS[kind]}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected block editor */}
        <div className="rounded-xl border border-border bg-paper p-5">
          {!selected ? (
            <p className="text-sm text-muted-foreground">
              Pick a page piece on the left to edit it, or add a new one.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold">
                {selectedIndex + 1}. {BLOCK_LABELS[selected.kind]}
              </p>

              {selected.kind === "cover" && (
                <p className="mt-3 text-sm text-muted-foreground">
                  The cover uses the issue’s cover words from the Setup tab — nothing to set here.
                </p>
              )}

              {selected.kind === "sectionBanner" && (
                <div className="mt-4 grid max-w-3xl gap-4 md:grid-cols-3">
                  <label className={fieldLabel}>
                    Section name
                    <Input
                      className="mt-1"
                      value={selected.config.title ?? ""}
                      onChange={(event) => update(selectedIndex, { title: event.target.value })}
                    />
                  </label>
                  <label className={fieldLabel}>
                    Colour
                    <select
                      className={selectClass}
                      value={selected.config.accent ?? ""}
                      onChange={(event) => update(selectedIndex, { accent: event.target.value || null })}
                    >
                      <option value="">Automatic</option>
                      {ACCENTS.map((accent) => (
                        <option key={accent} value={accent}>
                          {accent}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={fieldLabel}>
                    Banner shape
                    <select
                      className={selectClass}
                      value={selected.config.shape ?? ""}
                      onChange={(event) => update(selectedIndex, { shape: event.target.value || null })}
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
              )}

              {selected.kind === "hero" && (
                <div className="mt-4 grid max-w-3xl gap-4 md:grid-cols-2">
                  <label className={fieldLabel}>
                    Book
                    <select
                      className={selectClass}
                      value={selected.config.bookId ?? ""}
                      onChange={(event) => update(selectedIndex, { bookId: event.target.value || null })}
                    >
                      <option value="">Pick a book</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} — {book.author_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={fieldLabel}>
                    Hook line (optional)
                    <Textarea
                      className="mt-1"
                      rows={2}
                      value={selected.config.hook ?? ""}
                      onChange={(event) => update(selectedIndex, { hook: event.target.value })}
                    />
                  </label>
                </div>
              )}

              {(selected.kind === "grid" || selected.kind === "fanOut") && (
                <div className="mt-4 space-y-4">
                  <p className={fieldLabel}>Books</p>
                  <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                    {books.map((book) => {
                      const chosen = (selected.config.bookIds ?? []).includes(book.id);
                      return (
                        <label key={book.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1 shrink-0"
                            checked={chosen}
                            onChange={() =>
                              update(selectedIndex, {
                                bookIds: chosen
                                  ? (selected.config.bookIds ?? []).filter((id) => id !== book.id)
                                  : [...(selected.config.bookIds ?? []), book.id],
                              })
                            }
                          />
                          <span className="min-w-0">
                            {book.title} — {book.author_name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {selected.kind === "grid" && (
                    <label className={cn(fieldLabel, "max-w-sm")}>
                      Show one larger
                      <select
                        className={selectClass}
                        value={selected.config.featuredBookId ?? ""}
                        onChange={(event) =>
                          update(selectedIndex, { featuredBookId: event.target.value || null })
                        }
                      >
                        <option value="">All the same size</option>
                        {(selected.config.bookIds ?? []).map((id) => (
                          <option key={id} value={id}>
                            {books.find((book) => book.id === id)?.title ?? id}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {selected.kind === "fanOut" && (
                    <label className={cn(fieldLabel, "max-w-sm")}>
                      Heading (optional)
                      <Input
                        className="mt-1"
                        value={selected.config.heading ?? ""}
                        onChange={(event) => update(selectedIndex, { heading: event.target.value })}
                      />
                    </label>
                  )}
                </div>
              )}

              {selected.kind === "authorSpotlight" && (
                <div className="mt-4 grid max-w-4xl gap-4 md:grid-cols-2">
                  <label className={fieldLabel}>
                    Author
                    <select
                      className={selectClass}
                      value={selected.config.authorId ?? ""}
                      onChange={(event) => update(selectedIndex, { authorId: event.target.value || null })}
                    >
                      <option value="">Pick an author</option>
                      {authors.map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={fieldLabel}>
                    Photo web address (optional)
                    <Input
                      className="mt-1"
                      value={selected.config.imageUrl ?? ""}
                      onChange={(event) => update(selectedIndex, { imageUrl: event.target.value })}
                    />
                  </label>
                  <label className={cn(fieldLabel, "md:col-span-2")}>
                    Blurb (optional — their profile bio is used otherwise)
                    <Textarea
                      className="mt-1"
                      rows={4}
                      value={selected.config.body ?? ""}
                      onChange={(event) => update(selectedIndex, { body: event.target.value })}
                    />
                  </label>
                </div>
              )}

              {selected.kind === "personality" && (
                <div className="mt-4 grid max-w-4xl gap-4 md:grid-cols-2">
                  <label className={fieldLabel}>
                    Heading
                    <Input
                      className="mt-1"
                      value={selected.config.heading ?? ""}
                      onChange={(event) => update(selectedIndex, { heading: event.target.value })}
                    />
                  </label>
                  <label className={fieldLabel}>
                    Illustration web address (optional)
                    <Input
                      className="mt-1"
                      value={selected.config.imageUrl ?? ""}
                      onChange={(event) => update(selectedIndex, { imageUrl: event.target.value })}
                    />
                  </label>
                  <label className={cn(fieldLabel, "md:col-span-2")}>
                    Message
                    <Textarea
                      className="mt-1"
                      rows={6}
                      value={selected.config.body ?? ""}
                      onChange={(event) => update(selectedIndex, { body: event.target.value })}
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-border bg-paper p-3 lg:col-span-2 2xl:sticky 2xl:top-4 2xl:col-span-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Live preview
          </p>
          {previewData ? (
            <div className="max-h-[42rem] overflow-auto rounded-xl bg-background 2xl:max-h-[calc(100vh-10rem)]">
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
