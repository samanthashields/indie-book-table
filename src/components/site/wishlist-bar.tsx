import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { WishlistEntry } from "@/lib/wishlist";

function priceLine(entry: WishlistEntry) {
  const parts: string[] = [];
  if (entry.ebook_price != null) parts.push(`eBook $${entry.ebook_price.toFixed(2)}`);
  if (entry.print_price != null) parts.push(`Print $${entry.print_price.toFixed(2)}`);
  return parts.join(" · ");
}

function asText(entries: WishlistEntry[]) {
  return entries
    .map((entry) => {
      const prices = priceLine(entry);
      return `• ${entry.title} — ${entry.author}${prices ? ` (${prices})` : ""}`;
    })
    .join("\n");
}

function printSlip(entries: WishlistEntry[]) {
  const rows = entries
    .map(
      (entry) =>
        `<tr><td>${entry.title}</td><td>${entry.author}</td><td>${priceLine(entry) || "—"}</td></tr>`,
    )
    .join("");
  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) {
    toast.error("Your browser blocked the print window.");
    return;
  }
  win.document.write(`<!doctype html><html><head><title>My list — The Table</title>
    <style>
      body{font-family:Georgia,serif;color:#3a241f;padding:40px;}
      h1{font-size:28px;margin:0 0 4px;}
      p{margin:0 0 24px;color:#6b5a52;}
      table{width:100%;border-collapse:collapse;}
      th,td{text-align:left;padding:8px 6px;border-bottom:1px dashed #3a241f55;font-size:14px;}
      th{text-transform:uppercase;letter-spacing:.08em;font-size:11px;}
    </style></head><body>
    <h1>My list</h1><p>Books circled at The Table</p>
    <table><thead><tr><th>Title</th><th>Author</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

/** Tear-off order slip: the list of books the reader circled this visit. */
export function WishlistBar({
  entries,
  onClear,
}: {
  entries: WishlistEntry[];
  onClear: () => void;
}) {
  if (entries.length === 0) return null;

  const titles = entries.map((entry) => entry.title);

  return (
    <div className="sticky bottom-0 z-30 -mx-3 mt-14 rounded-t-2xl border border-border/70 bg-card px-4 py-3 shadow-md sm:mx-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-sm text-foreground">
          <span className="font-semibold">
            {entries.length} circled {entries.length === 1 ? "book" : "books"}
          </span>{" "}
          <span className="text-muted-foreground">— {titles.join(", ")}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void navigator.clipboard
                .writeText(asText(entries))
                .then(() => toast.success("List copied."))
                .catch(() => toast.error("Couldn't copy the list."));
            }}
          >
            Copy list
          </Button>
          <Button size="sm" onClick={() => printSlip(entries)}>
            Print slip
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear list
          </Button>
        </div>
      </div>
    </div>
  );
}
