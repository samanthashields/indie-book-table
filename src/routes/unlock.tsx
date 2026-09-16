import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unlockSite } from "@/lib/gate.functions";
import { subscribeEmail } from "@/lib/catalog.functions";
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
  const subscribe = useServerFn(subscribeEmail);

  const [showEntry, setShowEntry] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

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

  async function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubscribing(true);
    setSubscribeError(null);
    try {
      await subscribe({ data: { email, catalog: true, blog: true } });
      setSubscribed(true);
    } catch (err) {
      setSubscribeError(
        err instanceof Error && err.message.includes("valid email")
          ? "Enter a valid email address."
          : "Something went wrong — please try again.",
      );
    } finally {
      setSubscribing(false);
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

          <div className="mt-10">
            {subscribed ? (
              <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">
                You're on the list — we'll be in touch as soon as we open the doors.
              </p>
            ) : (
              <form onSubmit={onSubscribe} className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Join our community list for launch updates
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={subscribing}>
                    {subscribing ? "Joining…" : "Join"}
                  </Button>
                </div>
                {subscribeError && (
                  <p className="text-sm text-destructive">{subscribeError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Occasional updates only. No spam, ever.
                </p>
              </form>
            )}
          </div>

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
              <Button type="submit" variant="outline" className="w-full" disabled={busy}>
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
