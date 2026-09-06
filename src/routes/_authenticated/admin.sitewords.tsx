import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { SiteCopyField } from "@/components/admin/site-copy-field";
import { useSiteCopy } from "@/lib/catalog-admin";
import { OWNED_COPY_KEYS } from "@/lib/site-copy";

export const Route = createFileRoute("/_authenticated/admin/sitewords")({ component: AdminSiteWords });

const PRETTY: Record<string, string> = {
  "journal.hero.title": "Journal — heading",
  "journal.hero.subtitle": "Journal — sub-heading",
  "table.hero.title": "Issues page — heading",
  "table.hero.subtitle": "Issues page — sub-heading",
  "table.submit.intro": "Submit a book — intro words",
};

function label(key: string) {
  return PRETTY[key] ?? key.replace(/[._]/g, " ");
}

function AdminSiteWords() {
  const copy = useSiteCopy();
  const queryClient = useQueryClient();
  const rows = (copy.data ?? []).filter((row) => !OWNED_COPY_KEYS.has(row.key));
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["catalog-admin", "site-copy"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "site-copy"] });
  };

  return (
    <section className="max-w-3xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-2xl font-normal">Other site words</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Copy that doesn’t belong to the Table homepage or the mission page — the Journal and the submission form.
      </p>
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <SiteCopyField
            key={row.key}
            field={{ key: row.key, label: label(row.key), kind: "long" }}
            value={row.value}
            onSaved={refresh}
          />
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing else to edit yet.</p>}
      </div>
    </section>
  );
}
