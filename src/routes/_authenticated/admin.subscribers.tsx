import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ImageUp, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteSubscriber,
  getWelcomeEmail,
  listSubscribers,
  saveWelcomeEmail,
  sendWelcomeEmailTest,
  type Subscriber,
} from "@/lib/admin-subscribers.functions";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  head: () => ({
    meta: [
      { title: "Community list — Author's Workshop admin" },
      { name: "description", content: "See everyone who joined the community list, export it, and edit the welcome email." },
      { property: "og:title", content: "Community list — Author's Workshop admin" },
      { property: "og:description", content: "See everyone who joined the community list, export it, and edit the welcome email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSubscribers,
});

type WelcomeForm = {
  enabled: boolean;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  logoFile: string;
};

const slugName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");

/** Images in emails need a plain URL; this route serves the stored file. */
const logoPreviewUrl = (file: string) =>
  /^https?:\/\//.test(file) ? file : `/api/public/email-asset/${file}`;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function downloadCsv(rows: Subscriber[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    ["email", "community_catalog", "blog", "joined"].join(","),
    ...rows.map((row) =>
      [escape(row.email), row.catalog_opt_in ? "yes" : "no", row.blog_opt_in ? "yes" : "no", escape(row.subscribed_at)].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `community-list-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function WelcomeEmailPanel() {
  const settings = useQuery({ queryKey: ["welcome-email"], queryFn: () => getWelcomeEmail() });
  const [form, setForm] = useState<WelcomeForm | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const value = form ?? (settings.data as WelcomeForm | undefined) ?? null;
  const update = (patch: Partial<WelcomeForm>) => value && setForm({ ...value, ...patch });

  const pickLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const name = `logo-${Date.now()}-${slugName(file.name)}`;
      const { error } = await supabase.storage.from("email-assets").upload(name, file, { upsert: false });
      if (error) throw error;
      update({ logoFile: name });
      toast.success("Logo uploaded — save to use it");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t upload that image");
    } finally {
      setUploading(false);
      if (logoInput.current) logoInput.current.value = "";
    }
  };


  const save = useMutation({
    mutationFn: (data: WelcomeForm) => saveWelcomeEmail({ data }),
    onSuccess: () => toast.success("Welcome email saved"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "That didn’t save"),
  });
  const test = useMutation({
    mutationFn: (data: WelcomeForm) => sendWelcomeEmailTest({ data }),
    onSuccess: (result: any) => toast.success(`Test sent to ${result?.email ?? "your address"}`),
    onError: (error) => toast.error(error instanceof Error ? error.message : "The test didn’t send"),
  });

  if (!value) {
    return <p className="text-sm text-muted-foreground">Loading the welcome email…</p>;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal">Welcome email</h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Sent once to each new signup, the moment they join.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={value.enabled} onCheckedChange={(checked) => update({ enabled: checked })} aria-label="Send the welcome email" />
          {value.enabled ? "On" : "Paused"}
        </label>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="welcome-subject">Subject line</Label>
          <Input id="welcome-subject" value={value.subject} onChange={(e) => update({ subject: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome-headline">Headline</Label>
          <Input id="welcome-headline" value={value.headline} onChange={(e) => update({ headline: e.target.value })} />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="welcome-body">Message</Label>
          <Textarea id="welcome-body" rows={8} value={value.body} onChange={(e) => update({ body: e.target.value })} />
          <p className="text-xs text-muted-foreground">Leave a blank line between paragraphs.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome-cta-label">Button label (optional)</Label>
          <Input id="welcome-cta-label" value={value.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} placeholder="Visit the site" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome-cta-url">Button link (optional)</Label>
          <Input id="welcome-cta-url" value={value.ctaUrl} onChange={(e) => update({ ctaUrl: e.target.value })} placeholder="https://indiebooktable.com" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={save.isPending} onClick={() => save.mutate(value)}>
          Save welcome email
        </Button>
        <Button variant="outline" disabled={test.isPending} onClick={() => test.mutate(value)}>
          <Send className="size-4" />
          Send test to me
        </Button>
      </div>
    </section>
  );
}

function AdminSubscribers() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const subscribers = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => (await listSubscribers()) as Subscriber[],
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSubscriber({ data: { id } }),
    onSuccess: () => {
      toast.success("Signup removed");
      void queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "That didn’t work"),
  });

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const all = subscribers.data ?? [];
    return needle ? all.filter((row) => row.email.toLowerCase().includes(needle)) : all;
  }, [subscribers.data, query]);

  const total = subscribers.data?.length ?? 0;
  const recent = (subscribers.data ?? []).filter(
    (row) => Date.now() - new Date(row.subscribed_at).getTime() < 30 * 24 * 60 * 60 * 1000,
  ).length;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-normal">Community list</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} {total === 1 ? "person has" : "people have"} joined · {recent} in the last 30 days
            </p>
          </div>
          <Button variant="outline" disabled={rows.length === 0} onClick={() => downloadCsv(rows)}>
            <Download className="size-4" />
            Download CSV
          </Button>
        </div>

        <label className="relative mt-5 block max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search the community list"
          />
        </label>

        <div className="mt-5">
          {subscribers.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading the list…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {total === 0 ? "Nobody has joined yet." : "No signups match that search."}
            </p>
          ) : (
            <ul className="divide-y divide-border/70">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(row.subscribed_at)} ·{" "}
                      {[row.catalog_opt_in ? "community" : null, row.blog_opt_in ? "journal" : null]
                        .filter(Boolean)
                        .join(" and ") || "no lists"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(row.id)}
                    aria-label={`Remove ${row.email}`}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 max-w-prose text-xs text-muted-foreground">
          To send an update to everyone, download the CSV and import it into a newsletter service — campaign
          sending isn’t available from here, so it can’t affect delivery of sign-in and notification emails.
        </p>
      </section>

      <WelcomeEmailPanel />
    </div>
  );
}
