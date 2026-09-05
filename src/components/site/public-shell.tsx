import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

import { useCurrentUser } from "@/lib/use-current-user";

const links = [
  { label: "The Table", to: "/table" as const },
  { label: "Journal", to: "/journal" as const },
  { label: "Mission", to: "/mission" as const },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const signedIn = Boolean(user.data?.id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-6 px-5 md:px-8">
          <Link to="/table" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-cocoa text-paper">
              <BookOpen className="size-5" />
            </span>
            <span className="font-serif text-xl">Book Cycles</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-full px-3 py-2 bg-secondary text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={signedIn ? "/" : "/auth"}
              className="ml-2 rounded-full bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {signedIn ? "Author's Workshop" : "Sign in"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-10 md:px-8">{children}</main>

      <footer className="border-t border-border/60 bg-secondary/60">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground md:px-8">
          <p>The Table — a monthly issue of independent books, set by the Book Cycles editors.</p>
          <div className="flex gap-4">
            <Link to="/table" className="hover:text-foreground">The Table</Link>
            <Link to="/journal" className="hover:text-foreground">Journal</Link>
            <Link to="/mission" className="hover:text-foreground">Our mission</Link>
            <Link to="/auth" className="hover:text-foreground">Author sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
