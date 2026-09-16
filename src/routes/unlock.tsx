import { useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unlockSite } from "@/lib/gate.functions";
import falconAsset from "@/assets/falcon.svg.asset.json";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Coming soon — The Indie Book Table" },
      {
        name: "description",
        content:
          "We're building a new experience for independent authors and will be back soon.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [showEntry, setShowEntry] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const password = new FormData(e.currentTarget).get("password") as string;
    const { ok } = await unlock({ data: { password } });
    setBusy(false);
    if (ok) {
      await router.navigate({ to: "/" });
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-5">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          <img
            src={falconAsset.url}
            alt=""
            className="mx-auto h-20 w-auto"
            width={2000}
            height={2000}
          />
          <p className="mt-8 font-serif text-4xl font-normal leading-tight">The Indie Book Table</p>
          <h1 className="mt-6 text-lg font-semibold text-foreground">
            We're building something for indie authors
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A guided path from private manuscript to published book — plus a public table where
            readers can find your work. We're putting the finishing touches on and will be back
            soon.
          </p>

          {showEntry && (
            <form onSubmit={onSubmit} className="mt-10 space-y-3">
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                aria-label="Password"
                className="text-center"
                autoFocus
                required
              />
              {error && (
                <p className="text-sm text-destructive">
                  That password isn't quite right — try again.
                </p>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Checking…" : "Enter"}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Discreet admin entry — intentionally low-key */}
      <footer className="pb-6 pt-10 text-center">
        {showEntry ? (
          <button
            type="button"
            onClick={() => setShowEntry(false)}
            className="text-xs text-muted-foreground/60 underline-offset-4 hover:underline"
          >
            Close
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowEntry(true)}
            className="text-xs text-muted-foreground/60 underline-offset-4 hover:underline"
          >
            Admin sign in
          </button>
        )}
      </footer>
    </div>
  );
}
