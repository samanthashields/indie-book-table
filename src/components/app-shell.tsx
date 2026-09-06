import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageCircle, BookOpen, Library, LifeBuoy, LogOut, Menu, Newspaper, PanelLeftClose, Send, Shield, Sparkles, Users, Utensils, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PenLauncher } from "@/components/pen/pen-launcher";
import { NotificationBell } from "@/components/notification-bell";
import { claimInvitations } from "@/lib/collaborators";
import { signOut, useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

const nav = [
  { label: "My Books", to: "/" as const, icon: Library },
  { label: "My Cycles", to: "/cycles" as const, icon: Sparkles },
  { label: "Collaborations", to: "/collaborations" as const, icon: Users },
  { label: "Templates", to: "/templates" as const, icon: BookOpen },
  { label: "My Submissions", to: "/submissions" as const, icon: Send },
  { label: "Pen", to: "/pen" as const, icon: MessageCircle },
  { label: "The Table", to: "/table" as const, icon: Utensils },
  { label: "Journal", to: "/journal" as const, icon: Newspaper },
];



export function AppShell({ children, coachContext }: { children: ReactNode; coachContext?: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const displayName = user.data?.profile?.display_name || user.data?.email || "Reader";
  const initials = displayName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
  const planLabel = user.data?.profile?.plan === "paid" ? "Paid plan" : "Free plan";
  const isAdmin = Boolean(user.data?.roles.includes("admin"));
  const accountLabel = "Author";
  const userId = user.data?.id;

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
    <div className="min-h-screen bg-background text-foreground lg:flex lg:gap-4 lg:p-4">
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 shadow-lg transition-all duration-200 lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100vh-2rem)] lg:shrink-0 lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-xs", !navOpen && "-translate-x-full", collapsed && "lg:w-[76px]")}>
        <div className="mb-8 flex h-11 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="size-5" /></span>
            {!collapsed && <span className="font-serif text-xl font-normal">Author’s Workshop</span>}
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close navigation"><X /></Button>
        </div>
        <nav className="space-y-1">
          {nav.map(({ label, to, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return <Link key={label} to={to} onClick={() => setNavOpen(false)} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-sidebar-accent-foreground")}><Icon className="size-5 shrink-0" />{!collapsed && label}</Link>;
          })}
          <Link to="/help" onClick={() => setNavOpen(false)} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", pathname.startsWith("/help") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-sidebar-accent-foreground")}><LifeBuoy className="size-5 shrink-0" />{!collapsed && "Help Center"}</Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setNavOpen(false)} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", pathname.startsWith("/admin") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-sidebar-accent-foreground")}><Shield className="size-5 shrink-0" />{!collapsed && "Admin"}</Link>
          )}
        </nav>
        <div className="mt-auto space-y-2">
          <div className={cn("flex items-center gap-3 border-t border-sidebar-border pt-4", collapsed && "justify-center")}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">{initials}</span>
            {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-medium">{displayName}</p><p className="text-xs text-muted-foreground">{isAdmin ? "Editor" : accountLabel} · {planLabel}</p></div>}
            {!collapsed && <NotificationBell className="ml-auto shrink-0" />}
            {!collapsed && <Button variant="ghost" size="icon" className="shrink-0" onClick={() => void handleSignOut()} aria-label="Sign out"><LogOut className="size-4" /></Button>}
          </div>

          <Button variant="ghost" size="sm" className="hidden w-full justify-start lg:flex" onClick={() => setCollapsed((value) => !value)}><PanelLeftClose className={cn(collapsed && "rotate-180")} />{!collapsed && "Collapse"}</Button>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setNavOpen(false)} />}
      <div className="min-w-0 flex-1 lg:flex">
        <div className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setNavOpen(true)} aria-label="Open navigation"><Menu /></Button>
            <span className="font-serif text-lg font-semibold">Author’s Workshop</span>
            <div className="flex items-center gap-1"><NotificationBell /><Button variant="ghost" size="icon" onClick={() => void handleSignOut()} aria-label="Sign out"><LogOut /></Button></div>
          </header>
          <main className="mx-auto w-full max-w-[1120px] px-5 py-8 md:px-8 lg:px-8 lg:py-10">{children}</main>
        </div>
        <PenLauncher context={coachContext} />
      </div>
    </div>
  );
}
