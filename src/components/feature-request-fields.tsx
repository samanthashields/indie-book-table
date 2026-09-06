import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FEATURE_AREAS,
  FEATURE_PRIORITY_LABELS,
  FEATURE_PRIORITY_ORDER,
  MAX_FEATURE_ATTACHMENTS,
  uploadFeatureAttachment,
  type FeatureAttachment,
  type FeaturePriority,
} from "@/lib/feature-requests";

type Props = {
  area: string;
  onAreaChange: (value: string) => void;
  priority: FeaturePriority;
  onPriorityChange: (value: FeaturePriority) => void;
  links: string[];
  onLinksChange: (value: string[]) => void;
  attachments: FeatureAttachment[];
  onAttachmentsChange: (value: FeatureAttachment[]) => void;
};

/** Category, priority, links and screenshots — shared by the new-idea form and the author's edit view. */
export function FeatureRequestFields({
  area,
  onAreaChange,
  priority,
  onPriorityChange,
  links,
  onLinksChange,
  attachments,
  onAttachmentsChange,
}: Props) {
  const [linkDraft, setLinkDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const addLink = () => {
    const value = linkDraft.trim();
    if (!value) return;
    if (!/^https?:\/\/\S+$/i.test(value)) {
      toast.error("Paste a full web address starting with http");
      return;
    }
    if (links.includes(value)) {
      setLinkDraft("");
      return;
    }
    onLinksChange([...links, value]);
    setLinkDraft("");
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_FEATURE_ATTACHMENTS - attachments.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_FEATURE_ATTACHMENTS} screenshots`);
      return;
    }
    setUploading(true);
    const added: FeatureAttachment[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        added.push(await uploadFeatureAttachment(file));
      } catch {
        toast.error(`Couldn’t upload ${file.name}`);
      }
    }
    setUploading(false);
    if (added.length > 0) onAttachmentsChange([...attachments, ...added]);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={area} onValueChange={onAreaChange}>
          <SelectTrigger aria-label="Part of the workshop">
            <SelectValue placeholder="Which part of the workshop?" />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_AREAS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={(value) => onPriorityChange(value as FeaturePriority)}>
          <SelectTrigger aria-label="How much this matters">
            <SelectValue placeholder="How much does this matter?" />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_PRIORITY_ORDER.map((option) => (
              <SelectItem key={option} value={option}>
                {FEATURE_PRIORITY_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-sm font-semibold">Links (optional)</p>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="https://…"
            aria-label="Add a link"
            value={linkDraft}
            onChange={(event) => setLinkDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLink();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addLink}>
            <Plus />Add
          </Button>
        </div>
        {links.length > 0 && (
          <ul className="mt-2 space-y-1">
            {links.map((link) => (
              <li key={link} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{link}</span>
                <button
                  type="button"
                  aria-label={`Remove ${link}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onLinksChange(links.filter((item) => item !== link))}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold">Screenshots (optional)</p>
        <p className="text-xs text-muted-foreground">Up to {MAX_FEATURE_ATTACHMENTS} images. Only you and the team can open them until the idea is on the board.</p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="secondary" className="mt-2" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}Add screenshots
        </Button>
        {attachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {attachments.map((file) => (
              <li key={file.path} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onAttachmentsChange(attachments.filter((item) => item.path !== file.path))}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
