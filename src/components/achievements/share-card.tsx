import { forwardRef } from "react";

import deskImage from "@/assets/authors-table.jpg";
import { DECORATIONS, isDecorationKey } from "@/lib/decorations";
import type { PublishedBook } from "@/lib/achievements";

export type ShareCardProps = { authorName: string; books: PublishedBook[]; decorations: string[]; coverUrls: Record<string, string> };

/** Fixed 1200x630 picture used for downloads and the public share link. */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard({ authorName, books, decorations, coverUrls }, ref) {
  return (
    <div ref={ref} className="relative flex flex-col overflow-hidden bg-paper" style={{ width: 1200, height: 630 }}>
      <img src={deskImage} alt="" width={1536} height={1024} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-foreground/45" />

      {decorations.filter(isDecorationKey).map((key) => {
        const decoration = DECORATIONS[key];
        return (
          <img
            key={key}
            src={decoration.image}
            alt=""
            className="absolute object-contain"
            style={{ left: `${decoration.slot.left}%`, bottom: `${decoration.slot.bottom}%`, width: `${decoration.slot.width}%` }}
          />
        );
      })}

      <div className="relative flex h-full flex-col justify-between p-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-paper/80">The Indie Book Table</p>
          <h1 className="mt-2 font-serif text-5xl text-paper">{authorName}</h1>
          <p className="mt-2 text-lg text-paper/90">{books.length} {books.length === 1 ? "book published" : "books published"}</p>
        </div>

        <div className="flex items-end gap-5">
          {books.slice(0, 8).map((book) => {
            const url = coverUrls[book.id];
            return url ? (
              <img key={book.id} src={url} alt="" className="h-56 w-36 rounded-lg object-cover shadow-lg" />
            ) : (
              <span key={book.id} className="grid h-56 w-36 place-items-center rounded-lg bg-teal/70 font-serif text-5xl text-paper shadow-lg">
                {book.title.charAt(0)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
});
