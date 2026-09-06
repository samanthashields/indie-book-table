import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveSiteCopy, useSiteCopy } from "@/lib/catalog-admin";

export const Route = createFileRoute("/_authenticated/admin/sitewords")({ component: AdminSiteWords });

function AdminSiteWords() {
  const copy = useSiteCopy();
  const [edits, setEdits] = useState<Record<string, string>>({});

  return (
    <section className="max-w-3xl rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-2xl font-normal">Site words</h2>
      <p className="mt-1 text-sm text-muted-foreground">Short pieces of copy shown across The Table and the public pages.</p>
      <ul className="mt-6 space-y-6">
        {(copy.data ?? []).map((row) => (
          <li key={row.key}>
            <label className="block text-sm font-semibold">
              {row.key.replace(/_/g, " ")}
              <Textarea
                className="mt-2"
                rows={3}
                value={edits[row.key] ?? row.value}
                onChange={(event) => setEdits((current) => ({ ...current, [row.key]: event.target.value }))}
              />
            </label>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() =>
                void saveSiteCopy(row.key, edits[row.key] ?? row.value)
                  .then(() => toast.success("Saved"))
                  .catch(() => toast.error("Couldn’t save that"))
              }
            >
              Save
            </Button>
          </li>
        ))}
        {(copy.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">Nothing to edit yet.</li>}
      </ul>
    </section>
  );
}
