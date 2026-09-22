import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  LifeBuoy,
  Library,
  LogOut,
  Menu,
  MessageCircle,
  Newspaper,
  Send,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenLauncher } from "@/components/pen/pen-launcher";
import { NotificationBell } from "@/components/notification-bell";
import { WorkshopOnboarding } from "@/components/workshop-onboarding";
import { claimInvitations } from "@/lib/collaborators";
import { signOut, useCurrentUser } from "@/lib/use-current-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import falconAsset from "@/assets/falcon.svg.asset.json";

const primaryNav = [
  { label: "My Books", to: "/" as const, icon: Library },
  { label: "My Cycles", to: "/cycles" as const, icon: Sparkles },
  { label: "Templates", to: "/templates" as const, icon: BookOpen },
  { label: "Pen", to: "/pen" as const, icon: MessageCircle },
  { label: "The Table", to: "/table" as const, icon: Utensils },
  { label: "Help Center", to: "/help" as const, icon: LifeBuoy },
];

const moreNav = [
  { label: "My Table", to: "/my-table" as const, icon: Trophy },
  { label: "Collaborations", to: "/collaborations" as const, icon: Users },
  { label: "My Submissions", to: "/submissions" as const, icon: Send },
  { label: "Journal", to: "/journal" as const, icon: Newspaper },
];

const allNav = [...primaryNav, ...moreNav];

export function AppShell({
  children,
  coachContext,
  showPenLauncher = true,
}: {
  children: ReactNode;
  coachContext?: string;
  showPenLauncher?: boolean;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const displayName = user.data?.profile?.display_name || user.data?.email || "Reader";
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const planLabel = user.data?.profile?.plan === "paid" ? "Paid plan" : "Free plan";
  const isAdmin = Boolean(user.data?.roles.includes("admin"));
  const accountLabel = "Author";
  const userId = user.data?.id;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const moreActive = moreNav.some((item) => isActive(item.to));

  useEffect(() => {
    if (!userId) return;
    void claimInvitations().then((count) => {
      if (count > 0) {
        void queryClient.invalidateQueries({ queryKey: ["books"] });
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });
  }, [userId, queryClient]);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                <img
                  src={falconAsset.url}
                  alt=""
                  width={2000}
                  height={2000}
                  className="size-5 object-contain"
                />
              </span>
              <span className="hidden font-serif text-lg font-normal sm:inline">
                Author’s Workshop
              </span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {primaryNav.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    isActive(to)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                      moreActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    More
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {moreNav.map(({ label, to, icon: Icon }) => (
                    <DropdownMenuItem key={label} asChild>
                      <Link to={to}>
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <NotificationBell />
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
                  <p className="truncate text-sm font-semibold" title={displayName}>
                    {displayName}
                  </p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {isAdmin ? "Editor" : accountLabel} · {planLabel}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <ThemeToggle className="w-full" />
                </div>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="size-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-foreground/30" onClick={() => setNavOpen(false)} />
          <div className="fixed inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-border bg-card p-4 shadow-lg">
            <div className="mb-4 flex h-11 items-center justify-between">
              <span className="font-serif text-lg font-normal">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation"
              >
                <X />
              </Button>
            </div>
            <nav className="space-y-1">
              {allNav.map(({ label, to, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                    isActive(to)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                    isActive("/admin")
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Shield className="size-5 shrink-0" />
                  Admin
                </Link>
              )}
            </nav>
            <div className="mt-auto space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={displayName}>
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isAdmin ? "Editor" : accountLabel} · {planLabel}
                  </p>
                </div>
              </div>
              <ThemeToggle className="w-full" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <main className="mx-auto w-full max-w-[1120px] px-5 py-8 md:px-8 lg:px-8 lg:py-10">
          {children}
        </main>
        {showPenLauncher && <PenLauncher context={coachContext} />}
      </div>
      <WorkshopOnboarding />
    </div>
  );
}
