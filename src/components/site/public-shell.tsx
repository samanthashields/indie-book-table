import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Shield, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notification-bell";
import { signOut, useCurrentUser } from "@/lib/use-current-user";
import { ThemeToggle } from "@/components/theme-toggle";
import falconAsset from "@/assets/falcon.svg.asset.json";


const links = [
  { label: "The Table", to: "/table" as const },
  { label: "Issues", to: "/issues" as const },
  { label: "Journal", to: "/journal" as const },
  { label: "Mission", to: "/mission" as const },
];

const workshopLink = { label: "Author's Workshop", to: "/workshop" as const };

function AccountMenu() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const displayName = user.data?.profile?.display_name || user.data?.email || "Reader";
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const isAdmin = Boolean(user.data?.roles.includes("admin"));

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold" title={displayName}>{displayName}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/">Author's Workshop</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <Shield className="size-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const signedIn = Boolean(user.data?.id);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const siteTitle = "The Indie Book Table";
  const navLinks = signedIn ? links : [...links, workshopLink];
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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-lg px-3 py-2 bg-secondary text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={signedIn ? "/" : "/auth"}
              className="ml-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {signedIn ? "Author's Workshop" : "Sign in"}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            {signedIn && (
              <>
                <NotificationBell />
                <AccountMenu />
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="grid size-11 shrink-0 place-items-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-border/60 bg-paper px-5 py-3 text-sm font-semibold md:hidden">
            {navLinks.map((link) => (
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
              className="mt-2 flex h-12 items-center justify-center rounded-lg bg-primary px-4 text-primary-foreground"
            >
              {signedIn ? "Author's Workshop" : "Sign in"}
            </Link>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>

      <footer className="border-t border-border/60 bg-secondary/60">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8">
          <p>The Table — a monthly issue of independent books, set by The Indie Book Table editors.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/table" className="hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>The Table</Link>
            <Link to="/issues" className="hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>Issues</Link>
            <Link to="/journal" className="hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>Journal</Link>
            <Link to="/mission" className="hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>Our mission</Link>
            {!signedIn && (
              <Link to="/workshop" className="hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>Author's Workshop</Link>
            )}
            <Link to="/auth" className="hover:text-foreground">Author sign in</Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
