import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useOpenTicket } from "@/lib/help-db";

/**
 * The free plan has no self-serve checkout yet, so "upgrade" opens a support ticket the team
 * follows up on (same channel as Help Center > Contact support) instead of a dead-end toast.
 */
export function RequestUpgradeButton({ className }: { className?: string }) {
  const openTicket = useOpenTicket();

  const request = () => {
    openTicket.mutate(
      {
        subject: "Upgrade to the paid plan",
        body: "I'd like to upgrade to the paid plan so I can plan with Pen. Please follow up with next steps.",
      },
      {
        onSuccess: () => toast.success("Request sent — we'll follow up to get you upgraded."),
        onError: () => toast.error("Couldn't send that. Try again from Help Center > Contact support."),
      },
    );
  };

  return (
    <Button className={className} onClick={request} disabled={openTicket.isPending}>
      {openTicket.isPending ? <Loader2 className="animate-spin" /> : <Send />}
      {openTicket.isPending ? "Sending…" : "Request the upgrade"}
    </Button>
  );
}
