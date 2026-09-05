import { toast } from "sonner";

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
    <div className="sticky bottom-0 z-30 -mx-3 mt-14 border-t-4 border-dashed border-cocoa bg-amber px-4 py-3 sm:mx-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-[0.9rem] text-cocoa">
          <span className="font-bold uppercase tracking-[0.08em]">
            {entries.length} circled {entries.length === 1 ? "book" : "books"}
          </span>{" "}
          <span className="opacity-80">— {titles.join(", ")}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard
                .writeText(asText(entries))
                .then(() => toast.success("List copied."))
                .catch(() => toast.error("Couldn't copy the list."));
            }}
            className="panel-outline-thin bg-card px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-cocoa"
          >
            Copy list
          </button>
          <button
            type="button"
            onClick={() => printSlip(entries)}
            className="panel-outline-thin bg-leaf px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-cocoa"
          >
            Print slip
          </button>
          <button
            type="button"
            onClick={onClear}
            className="panel-outline-thin bg-paper px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-cocoa"
          >
            Clear list
          </button>
        </div>
      </div>
    </div>
  );
}
