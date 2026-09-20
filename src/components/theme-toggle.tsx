import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { applyTheme, getThemePref, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "Auto", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("light");

  useEffect(() => {
    setPref(getThemePref());
  }, []);

  // In Auto, follow the device when its setting changes.
  useEffect(() => {
    if (pref !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme("system");
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [pref]);

  const choose = (value: ThemePref) => {
    setPref(value);
    applyTheme(value);
  };

  return (
    <div role="group" aria-label="Colour theme" className={cn("inline-flex rounded-full bg-secondary p-0.5", className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={pref === value}
          onClick={() => choose(value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            pref === value ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
