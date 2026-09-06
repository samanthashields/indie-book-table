import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveSiteCopy } from "@/lib/catalog-admin";
import { uploadCatalogCover, useCatalogCoverUrl } from "@/lib/catalog-covers";
import { SITE_COPY_DEFAULTS, type SiteCopyField as Field } from "@/lib/site-copy";
import { useCurrentUser } from "@/lib/use-current-user";

export function SiteCopyField({
  field,
  value,
  onSaved,
}: {
  field: Field;
  value: string;
  onSaved: () => void;
}) {
  const user = useCurrentUser();
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const preview = useCatalogCoverUrl(field.kind === "image" ? draft : undefined);
  const shown = preview.data ?? (draft || SITE_COPY_DEFAULTS[field.key] || "");

  const save = async (next: string) => {
    setBusy(true);
    try {
      await saveSiteCopy(field.key, next);
      toast.success("Saved");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t save that");
    } finally {
      setBusy(false);
    }
  };

  if (field.kind === "image") {
    return (
      <div className="rounded-2xl border border-border bg-paper p-4">
        <p className="text-sm font-semibold">{field.label}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {shown && (
            <img
              src={shown}
              alt=""
              className="h-24 w-32 rounded-xl border border-border object-cover"
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-xl border border-input bg-card px-3 py-2 text-sm font-semibold">
              {busy ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy || !user.data?.id}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file || !user.data?.id) return;
                  setBusy(true);
                  try {
                    const path = await uploadCatalogCover(user.data.id, file);
                    setDraft(path);
                    await saveSiteCopy(field.key, path);
                    toast.success("Image updated");
                    onSaved();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Upload failed");
                  } finally {
                    setBusy(false);
                    event.target.value = "";
                  }
                }}
              />
            </label>
            {draft && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setDraft("");
                  void save("");
                }}
              >
                Use the default
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-paper p-4">
      <label className="block text-sm font-semibold">
        {field.label}
        {field.kind === "long" ? (
          <Textarea
            className="mt-2"
            rows={4}
            placeholder={SITE_COPY_DEFAULTS[field.key] ?? ""}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        ) : (
          <Input
            className="mt-2"
            placeholder={SITE_COPY_DEFAULTS[field.key] ?? ""}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        )}
      </label>
      <Button
        size="sm"
        variant="outline"
        className="mt-2"
        disabled={busy || draft === value}
        onClick={() => void save(draft)}
      >
        Save
      </Button>
    </div>
  );
}
