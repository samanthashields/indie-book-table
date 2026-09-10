import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import falconAsset from "@/assets/falcon.svg.asset.json";


type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — The Indie Book Table" },
    { name: "description", content: "Sign in to your publishing workspace, or create an author or collaborator account." },
    { property: "og:title", content: "Sign in — The Indie Book Table" },
    { property: "og:description", content: "Sign in to your publishing workspace, or create an author or collaborator account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.8c2.2-2 3.7-5 3.7-8.5z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.8c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1L1.2 17.1C3.2 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4L1.2 6.9C.4 8.5 0 10.2 0 12s.4 3.5 1.2 5.1l3.8-2.7z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.8 1.2 6.9L5 9.6c1-2.9 3.8-4.9 7-4.9z"/></svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async () => {
    setBusy(true); setError(null); setNotice(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
      });
      setBusy(false);
      if (error) { setError(error.message); return; }
      if (!data.session) { setAwaitingConfirm(true); return; }
      void navigate({ to: "/" });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    void navigate({ to: "/" });
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setError(result.error.message ?? "Google sign-in failed"); return; }
    if (result.redirected) return;
    void navigate({ to: "/" });
  };

  const forgot = async () => {
    if (!email) { setError("Enter your email address first."); return; }
    setBusy(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setForgotSent(true);
  };

  if (awaitingConfirm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-teal/15"><Mail className="size-6 text-teal" /></span>
          <h1 className="font-serif text-3xl font-normal">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">We sent a confirmation link to <strong>{email}</strong>. Open it to finish creating your account.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setAwaitingConfirm(false); setMode("signin"); }}>Back to sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_minmax(420px,560px)]">
      <aside className="hidden flex-col justify-between bg-inkblue/10 p-12 lg:flex">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="The Indie Book Table">
          <img src={brandLogoAsset.url} alt="" className="h-16 w-auto" width={2000} height={2000} />
        </Link>


        <div>
          <h2 className="font-serif text-5xl font-normal leading-tight">Every great book deserves a plan.</h2>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">A guided path from private manuscript to published book, with a calm coach beside you the whole way.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Six phases, paced around your launch date", "One clear next step at a time", "Your editors and readers in one place"].map((line) => (
              <li key={line} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-leaf/25"><Check className="size-3.5" /></span>{line}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">For independent authors and the people who help them.</p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Link to="/" className="flex min-w-0 items-center gap-3" aria-label="The Indie Book Table"><img src={brandLogoAsset.url} alt="" className="h-10 w-auto" width={2000} height={2000} /></Link></div>


          <div className="mb-6 grid grid-cols-2 rounded-xl bg-secondary p-1">
            {([["signin", "Sign in"], ["signup", "Create account"]] as const).map(([value, label]) => (
              <button key={value} onClick={() => { setMode(value); setError(null); setForgotSent(false); }} className={cn("h-10 rounded-lg text-sm font-semibold transition-colors", mode === value ? "bg-card shadow-xs" : "text-muted-foreground")}>{label}</button>
            ))}
          </div>

          <h1 className="font-serif text-3xl font-normal">{mode === "signin" ? "Author's Workshop Sign In" : "Author's Workshop Sign Up"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "Pick up right where your book left off." : "Your shelf, your cycles, and any book shared with you."}</p>

          <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            {mode === "signup" && (
              <>
                <p className="rounded-xl border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">One account covers everything: write your own books, and accept invitations to help on other authors&rsquo; books.</p>
                <label className="block text-sm font-semibold">Your name<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Mara Ellison" autoComplete="name" /></label>
              </>
            )}
            <label className="block text-sm font-semibold">Email<Input type="email" required className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
            <label className="block text-sm font-semibold">Password<Input type="password" required minLength={6} className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>

            {error && <p className="rounded-xl border border-clay/50 bg-clay/12 p-3 text-sm">{error}</p>}
            {forgotSent && <p className="rounded-xl border border-teal/40 bg-teal/12 p-3 text-sm">Password reset link sent to {email}.</p>}

            <Button type="submit" className="w-full" disabled={busy}>{busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
          </form>

          {mode === "signin" && <button onClick={() => void forgot()} disabled={busy} className="mt-3 text-sm font-semibold text-primary hover:underline">Forgot your password?</button>}

          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button variant="outline" className="w-full" onClick={() => void google()}><GoogleIcon />Continue with Google</Button>
        </div>
      </main>
    </div>
  );
}
