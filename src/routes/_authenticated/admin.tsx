import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
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

  if (user.isLoading || user.isFetching) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </AppShell>
    );
  }

  if (!user.data?.roles.includes("admin")) {
    const label = user.data?.profile?.display_name || user.data?.email || "this account";
    return (
      <AppShell>
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <h1 className="font-serif text-3xl font-normal">The admin area is for editors</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as <span className="font-semibold text-foreground">{label}</span>, which can
            write book cycles, submit books to The Table and read the Journal — but not curate issues or
            manage accounts.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">Back to my books</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/auth">Sign in with another account</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading title="Admin" description="People, global templates, The Table, and what’s happening across Book Cycles." />
      <nav className="-mt-4 mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            return (
              <Link key={tab.to} to={tab.to} className={cn("rounded-xl border px-4 py-2 text-sm font-semibold transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-card text-muted-foreground hover:text-foreground")}>{tab.label}</Link>
            );
          })}
      </nav>
      <Outlet />
    </AppShell>
  );
}
