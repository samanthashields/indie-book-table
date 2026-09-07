import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import deskImage from "@/assets/authors-table.jpg";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PublishedBook } from "@/lib/achievements";
import { DECORATIONS, isDecorationKey } from "@/lib/decorations";

export function AuthorTable({ books, decorations = [] }: { books: PublishedBook[]; decorations?: string[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs" aria-label="Your writing table">
      <div className="relative">
        <img src={deskImage} alt="An author's writing table with a lamp, notebook and cup of tea" width={1536} height={1024} className="h-56 w-full object-cover sm:h-72 md:h-80" />
        {decorations.filter(isDecorationKey).map((key) => (
          <img
            key={key}
            src={DECORATIONS[key].image}
            alt={DECORATIONS[key].label}
            className="absolute object-contain drop-shadow-md"
            style={{ left: `${DECORATIONS[key].slot.left}%`, bottom: `${DECORATIONS[key].slot.bottom}%`, width: `${DECORATIONS[key].slot.width}%` }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/25 to-transparent" aria-hidden="true" />
      </div>


      <div className="border-t border-border bg-paper p-5 sm:p-7">
        {books.length === 0 ? (
          <div className="text-center">
            <h3 className="font-serif text-2xl font-normal">The table is set, waiting for your first book</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              When you end a book cycle and say the book was published, it takes its place here for good.
            </p>
            <Button asChild className="mt-5"><Link to="/books/new"><Sparkles />Start a book cycle</Link></Button>
          </div>
        ) : (
          <TooltipProvider delayDuration={150}>
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
              {books.map((book) => (
                <li key={book.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/books/$bookId/details" params={{ bookId: book.id }} className="group block focus-visible:outline-none">
                        <BookCover src={book.coverUrl} title={book.title} className="w-full transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1" fallbackClassName="text-3xl" />
                        <p className="mt-2 truncate text-center text-xs font-semibold">{book.title}</p>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-xs">{book.publishedLabel ? `Published ${book.publishedLabel}` : "Published"}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        )}
      </div>
    </section>
  );
}
