import { Link } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";

import { usePenQuickActions } from "@/lib/pen-quick-actions";

export function PenQuickActions({
  section,
  disabled,
  onPick,
}: {
  section?: string | undefined;
  disabled?: boolean | undefined;
  onPick: (prompt: string) => void;
}) {
  const actions = usePenQuickActions(section);
  const visible = (actions.data ?? []).filter((action) => !action.hidden);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {visible.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled ?? false}
          onClick={() => onPick(action.prompt)}
          className="rounded-md border border-teal/45 bg-teal/12 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-teal/25 disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
      <Link
        to="/pen/buttons"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        title="Choose your own quick buttons"
      >
        <Settings2 className="size-3.5" />
        Edit buttons
      </Link>
    </div>
  );
}
