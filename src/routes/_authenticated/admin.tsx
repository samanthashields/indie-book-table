import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

type AdminPath =
  | "/admin" | "/admin/submissions" | "/admin/issues" | "/admin/journal" | "/admin/tablehome"
  | "/admin/missionpage" | "/admin/sitewords" | "/admin/people" | "/admin/subscribers"
  | "/admin/templates" | "/admin/challenges" | "/admin/onboarding" | "/admin/help"
  | "/admin/support" | "/admin/requests" | "/admin/releases" | "/admin/activity";

type AdminSection = { label: string; items: { label: string; to: AdminPath; exact?: boolean }[] };

const sections: AdminSection[] = [
  { label: "Overview", items: [{ label: "Dashboard", to: "/admin" as const, exact: true }] },
  { label: "Editorial", items: [
    { label: "Submissions", to: "/admin/submissions" as const }, { label: "Issues", to: "/admin/issues" as const },
    { label: "Journal", to: "/admin/journal" as const }, { label: "Table homepage", to: "/admin/tablehome" as const },
    { label: "Mission page", to: "/admin/missionpage" as const }, { label: "Site words", to: "/admin/sitewords" as const },
  ] },
  { label: "Community", items: [{ label: "People", to: "/admin/people" as const }, { label: "Community list", to: "/admin/subscribers" as const }] },
  { label: "Workshop", items: [
    { label: "Templates", to: "/admin/templates" as const }, { label: "Challenges", to: "/admin/challenges" as const },
    { label: "Onboarding", to: "/admin/onboarding" as const },
  ] },
  { label: "Operations", items: [
    { label: "Help articles", to: "/admin/help" as const }, { label: "Support", to: "/admin/support" as const },
    { label: "Feature requests", to: "/admin/requests" as const }, { label: "Release notes", to: "/admin/releases" as const },
    { label: "Activity log", to: "/admin/activity" as const },
  ] },
];


function AdminLayout() {
  const user = useCurrentUser();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const allItems = sections.flatMap((section) => section.items);
  const activeItem = allItems.find((item) => item.exact ? pathname === item.to : pathname.startsWith(item.to));

  if (user.isLoading || (user.isFetching && !user.data)) {
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
      <PageHeading title="Admin" description="People, global templates, The Table, and what’s happening across The Indie Book Table." />
      <div className="mb-6 md:hidden">
        <label htmlFor="admin-sections" className="mb-2 block text-sm font-semibold">Admin page</label>
        <div className="relative">
          <select id="admin-sections" value={activeItem?.to ?? "/admin"} onChange={(event) => { window.location.href = event.target.value; }} className="h-11 w-full appearance-none rounded-lg border border-border bg-card px-4 pr-10 text-sm font-semibold">
            {sections.map((section) => (
              <optgroup key={section.label} label={section.label}>{section.items.map((item) => <option key={item.to} value={item.to}>{item.label}</option>)}</optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="grid min-w-0 gap-8 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="sticky top-6 hidden self-start border-r border-border pr-5 md:block" aria-label="Admin navigation">
          {sections.map((section) => <div key={section.label} className="mb-6">
            <p className="mb-1 px-3 text-xs font-semibold text-muted-foreground">{section.label}</p>
            <div className="space-y-0.5">{section.items.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return <Link key={item.to} to={item.to} className={cn("block rounded-md border-l-2 px-3 py-2 text-sm transition-colors", active ? "border-primary bg-secondary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground")}>{item.label}</Link>;
            })}</div>
          </div>)}
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </AppShell>
  );
}
