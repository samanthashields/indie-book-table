import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Reset your password — Book Cycles" },
    { name: "description", content: "Choose a new password for your Book Cycles account." },
    { property: "og:title", content: "Reset your password — Book Cycles" },
    { property: "og:description", content: "Choose a new password for your Book Cycles account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isRecovery = window.location.hash.includes("type=recovery");

  const submit = async () => {
    setError(null);
    if (password.length < 6) { setError("Use at least 6 characters."); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => void navigate({ to: "/" }), 1600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xs">
        <Link to="/" className="mb-8 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="size-5" /></span><span className="font-serif text-xl font-normal">Book Cycles</span></Link>
        {done ? (
          <div className="text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-leaf/25"><CheckCircle2 className="size-6" /></span>
            <h1 className="font-serif text-3xl font-normal">Password updated</h1>
            <p className="mt-2 text-sm text-muted-foreground">Taking you back to your books…</p>
          </div>
        ) : !isRecovery ? (
          <>
            <h1 className="font-serif text-3xl font-normal">Open your reset link</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">This page only works from the password-reset link we emailed you. Request a new one if yours has expired.</p>
            <Button asChild className="mt-6 w-full"><Link to="/auth">Request a reset link</Link></Button>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-normal">Choose a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">Pick something you'll remember on deadline day.</p>
            <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
              <label className="block text-sm font-semibold">New password<Input type="password" required className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label>
              <label className="block text-sm font-semibold">Confirm new password<Input type="password" required className="mt-2" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" /></label>
              {error && <p className="rounded-xl border border-clay/50 bg-clay/12 p-3 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
