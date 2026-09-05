import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMarkNotificationsRead, useNotifications } from "@/lib/notifications";

export function NotificationBell({ className }: { className?: string }) {
  const notifications = useNotifications();
  const markRead = useMarkNotificationsRead();
  const items = notifications.data ?? [];
  const unread = items.filter((item) => !item.read_at);

  return (
    <Popover onOpenChange={(open) => { if (open && unread.length > 0) markRead.mutate(unread.map((item) => item.id)); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label={unread.length > 0 ? `Notifications, ${unread.length} unread` : "Notifications"}>
          <span className="relative inline-flex">
            <Bell className="size-4" />
            {unread.length > 0 && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber" />}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b border-border px-4 py-3 text-sm font-semibold">Notifications</p>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nothing new. Invitations, assignments and pacing nudges show up here.</p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.body && <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
