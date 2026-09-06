import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { SiteCopyField } from "@/components/admin/site-copy-field";
import { useSiteCopy } from "@/lib/catalog-admin";
import { MISSION_FIELDS } from "@/lib/site-copy";

export const Route = createFileRoute("/_authenticated/admin/missionpage")({ component: AdminMissionPage });

function AdminMissionPage() {
  const copy = useSiteCopy();
  const queryClient = useQueryClient();
  const values = new Map((copy.data ?? []).map((row) => [row.key, row.value]));
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["catalog-admin", "site-copy"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "site-copy"] });
  };

  return (
    <section className="max-w-3xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-2xl font-normal">Mission page</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The headline, the story, the quotes and the two pictures on the mission page.
      </p>
      <div className="mt-6 space-y-4">
        {MISSION_FIELDS.map((field) => (
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
