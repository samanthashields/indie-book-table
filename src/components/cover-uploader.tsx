import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeBookFile, uploadBookFile, useFileUrl } from "@/lib/book-files";

export function CoverUploader({
  bookId,
  title,
  coverUrl,
  onChange,
  saving,
}: {
  bookId: string;
  title: string;
  coverUrl: string | null;
  onChange: (value: string | null) => void;
  saving?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const preview = useFileUrl(coverUrl);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadBookFile(bookId, "cover", file);
      onChange(path);
      toast.success("Cover uploaded");
    } catch {
      toast.error("Couldn’t upload that image");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const clear = async () => {
    if (coverUrl && !/^https?:\/\//.test(coverUrl)) {
      try { await removeBookFile(coverUrl); } catch { /* file may already be gone */ }
    }
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      {preview.data ? (
        <img src={preview.data} alt={`Current cover artwork for ${title}`} width={768} height={1152} className="aspect-[2/3] w-32 rounded-xl object-cover shadow-sm" />
      ) : (
        <span className="grid aspect-[2/3] w-32 place-items-center rounded-xl bg-teal/15 font-serif text-5xl text-primary shadow-sm">{title.charAt(0) || "?"}</span>
      )}
      <div className="min-w-0">
        <p className="text-sm leading-6 text-muted-foreground">Upload the cover you want to show across your book cycle. A working sketch is fine — you can replace it any time.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={() => input.current?.click()} disabled={busy || saving}>{busy ? "Uploading…" : "Upload cover"}</Button>
          {coverUrl && <Button type="button" variant="outline" onClick={() => void clear()} disabled={busy || saving}>Remove</Button>}
          <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(event) => void pick(event.target.files?.[0])} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">JPG or PNG, portrait, at least 1600 px tall. Saved with the rest of your details.</p>
      </div>
    </div>
  );
}
