import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

const tabs = [
  { label: "Dashboard", to: "/admin" as const, exact: true },
  { label: "Submissions", to: "/admin/submissions" as const },
  { label: "Issues", to: "/admin/issues" as const },
  { label: "Journal & copy", to: "/admin/journal" as const },
  { label: "People", to: "/admin/people" as const },
  { label: "Templates", to: "/admin/templates" as const },
  { label: "Activity log", to: "/admin/activity" as const },
];


function AdminLayout() {
  const user = useCurrentUser();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (user.isLoading) return <AppShell><p className="text-sm text-muted-foreground">Checking your access…</p></AppShell>;
  if (!user.data?.roles.includes("admin")) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-border bg-paper p-8 text-center">
          <h1 className="font-serif text-3xl font-normal">This area is for the Book Cycles team</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your account doesn’t have admin access. If you think that’s wrong, ask the team to grant it.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-8 border-b border-border/70 pb-6">
        <h1 className="font-serif text-4xl font-normal">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">People, global templates, and what’s happening across Book Cycles.</p>
        <nav className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            return (
              <Link key={tab.to} to={tab.to} className={cn("rounded-xl px-4 py-2 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>{tab.label}</Link>
            );
          })}
        </nav>
      </header>
      <Outlet />
    </AppShell>
  );
}
