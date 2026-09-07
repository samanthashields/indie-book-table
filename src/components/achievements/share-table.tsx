import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { ShareCard } from "@/components/achievements/share-card";
import { Button } from "@/components/ui/button";
import type { PublishedBook } from "@/lib/achievements";
import { inlineFileUrl } from "@/lib/book-files";
import { saveTableShare } from "@/lib/table-share.functions";

/** Renders the table as a picture the author can download or publish as a link. */
export function ShareTable({ authorName, books, decorations }: { authorName: string; books: PublishedBook[]; decorations: string[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"download" | "link" | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const publish = useServerFn(saveTableShare);
  const client = useQueryClient();

  const render = async () => {
    const entries = await Promise.all(
      books.slice(0, 8).map(async (book) => [book.id, await inlineFileUrl(book.coverUrl)] as const),
    );
    const map: Record<string, string> = {};
    for (const [id, url] of entries) if (url) map[id] = url;
    setCoverUrls(map);
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    const node = cardRef.current;
    if (!node) throw new Error("Nothing to draw");
    const { toPng } = await import("html-to-image");
    return await toPng(node, { width: 1200, height: 630, pixelRatio: 1, cacheBust: true });
  };

  const download = async () => {
    setBusy("download");
    try {
      const dataUrl = await render();
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "my-writing-table.png";
      link.click();
    } catch {
      toast.error("The picture couldn’t be made. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const makeLink = async () => {
    setBusy("link");
    try {
      const dataUrl = await render();
      const share = await publish({ data: { image: dataUrl, authorName, bookCount: books.length } });
      const url = `${window.location.origin}/shelf/${share.slug}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => undefined);
      void client.invalidateQueries({ queryKey: ["table-share"] });
      toast.success("Your table link is ready and copied.");
    } catch {
      toast.error("The link couldn’t be created. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={download} disabled={busy !== null || books.length === 0}>
        {busy === "download" ? <Loader2 className="animate-spin" /> : <Download />}Save a picture
      </Button>
      <Button variant="outline" onClick={makeLink} disabled={busy !== null || books.length === 0}>
        {busy === "link" ? <Loader2 className="animate-spin" /> : <Share2 />}Make a share link
      </Button>
      {shareUrl && (
        <button
          type="button"
          onClick={() => { void navigator.clipboard.writeText(shareUrl); toast.success("Link copied."); }}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Copy className="size-3.5" />{shareUrl}
        </button>
      )}

      <div className="pointer-events-none fixed -left-[4000px] top-0" aria-hidden="true">
        <ShareCard ref={cardRef} authorName={authorName} books={books} decorations={decorations} coverUrls={coverUrls} />
      </div>
    </div>
  );
}
