import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { SiteCopyField } from "@/components/admin/site-copy-field";
import { useSiteCopy } from "@/lib/catalog-admin";
import { WORKSHOP_FIELDS } from "@/lib/site-copy";

export const Route = createFileRoute("/_authenticated/admin/workshoppage")({ component: AdminWorkshopPage });

function AdminWorkshopPage() {
  const copy = useSiteCopy();
  const queryClient = useQueryClient();
  const values = new Map((copy.data ?? []).map((row) => [row.key, row.value]));
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["catalog-admin", "site-copy"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "site-copy"] });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-2xl font-normal">Workshop page</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Every heading, paragraph, plan detail and picture on the public Author’s Workshop page. Leave a field empty to use the wording we ship with.
      </p>
      <div className="mt-6 space-y-4">
        {WORKSHOP_FIELDS.map((field) => (
          <SiteCopyField
            key={field.key}
            field={field}
            value={values.get(field.key) ?? ""}
            onSaved={refresh}
          />
        ))}
      </div>
    </section>
  );
}
