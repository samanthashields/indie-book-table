import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

export type CollectionView = "list" | "grid";

/**
 * The author's grid/list default, stored on their profile so it follows them
 * across devices. One global preference for every collection page; `initial` is
 * only used until they've picked one.
 */
export function useCollectionView(initial: CollectionView = "list") {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user.data?.id;
  const view = user.data?.profile?.view_preference ?? initial;

  const save = useMutation({
    mutationFn: async (next: CollectionView) => {
      if (!userId) return;
      const { error } = await supabase.from("profiles").update({ view_preference: next }).eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: (next) => {
      queryClient.setQueryData<typeof user.data>(["current-user"], (current) =>
        current && current.profile ? { ...current, profile: { ...current.profile, view_preference: next } } : current,
      );
    },
    onError: () => {
      toast.error("Couldn’t save your view preference");
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });

  const chooseView = (next: CollectionView) => save.mutate(next);

  return [view, chooseView] as const;
}

export function ViewSwitcher({ view, onChange, label = "Choose how items are shown" }: {
  view: CollectionView;
  onChange: (view: CollectionView) => void;
  label?: string;
}) {
  const options = [
    { value: "list" as const, label: "List", icon: List },
    { value: "grid" as const, label: "Grid", icon: LayoutGrid },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid shrink-0 grid-cols-2 rounded-lg border border-border bg-card p-1 shadow-xs" role="group" aria-label={label}>
        {options.map(({ value, label: optionLabel, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`${optionLabel} view`}
                aria-pressed={view === value}
                onClick={() => onChange(value)}
                className={cn(
                  "h-9 min-w-9 rounded-md px-2 sm:min-w-[5.25rem] sm:px-3",
                  view === value ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{optionLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">{optionLabel} view</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}