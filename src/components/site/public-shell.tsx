import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useCurrentUser } from "@/lib/use-current-user";
import { ThemeToggle } from "@/components/theme-toggle";
import falconAsset from "@/assets/falcon.svg.asset.json";


const links = [
  { label: "The Table", to: "/table" as const },
  { label: "Issues", to: "/issues" as const },
  { label: "Journal", to: "/journal" as const },
  { label: "Mission", to: "/mission" as const },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const signedIn = Boolean(user.data?.id);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const siteTitle = "The Indie Book Table";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto grid h-16 w-full max-w-[1120px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 md:flex md:gap-6 md:px-8">
          <Link to="/table" className="flex min-w-0 items-center gap-3" aria-label={siteTitle}>
            <img
              src={falconAsset.url}
              alt=""
              className="h-9 w-auto"
              width={2000}
              height={2000}
            />
            <span className="truncate font-serif text-xl font-normal">{siteTitle}</span>
          </Link>


          <nav className="ml-auto hidden items-center gap-1 text-sm font-semibold md:flex">
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

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="grid size-11 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-border/60 bg-paper px-5 py-3 text-sm font-semibold md:hidden">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center rounded-xl px-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "flex h-12 items-center rounded-xl px-3 bg-secondary text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={signedIn ? "/" : "/auth"}
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex h-12 items-center justify-center rounded-full bg-primary px-4 text-primary-foreground"
            >
              {signedIn ? "Author's Workshop" : "Sign in"}
            </Link>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>

      <footer className="border-t border-border/60 bg-secondary/60">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8">
          <p>The Table — a monthly issue of independent books, set by the Book Cycles editors.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/table" className="hover:text-foreground">The Table</Link>
            <Link to="/issues" className="hover:text-foreground">Issues</Link>
            <Link to="/journal" className="hover:text-foreground">Journal</Link>
            <Link to="/mission" className="hover:text-foreground">Our mission</Link>
            <Link to="/auth" className="hover:text-foreground">Author sign in</Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
