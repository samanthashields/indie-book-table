import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Shared-password "coming soon" site gate. This is a gate, not
 * authentication: one shared password, no per-user identity. Remove at
 * launch by deleting the beforeLoad check in __root.tsx, the /unlock route,
 * and this file.
 */

type GateSession = { unlocked?: boolean };

// Built per call — process.env is injected per request on the server runtime,
// so a module-scope read would be undefined.
// h3's sealSession throws "Empty password" on a missing/short secret, which would
// 500 every page load (the gate runs in __root beforeLoad). Derive a stable
// fallback from SITE_PASSWORD so the gate degrades to "still locked" rather than
// crashing if SESSION_SECRET isn't bound in an environment.
function sessionPassword(): string {
  const secret = process.env["SESSION_SECRET"];
  if (secret && secret.length >= 32) return secret;
  const seed = secret || process.env["SITE_PASSWORD"] || "";
  if (!seed) return "";
  return createHash("sha256").update(`site-gate:${seed}`, "utf8").digest("hex");
}

function getSessionConfig() {
  return {
    password: sessionPassword(),
    name: "site-gate",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

// Hash both sides to equal-length digests first: timingSafeEqual throws on a
// length mismatch, and the raw length itself would leak through timing.
function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const isUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  // Never throw: this runs in __root beforeLoad, so an error here would replace
  // every page (including /unlock) with an error screen. Fail closed instead.
  try {
    const session = await useSession<GateSession>(getSessionConfig());
    return { unlocked: session.data.unlocked === true };
  } catch (error) {
    console.error("site gate session read failed", error);
    return { unlocked: false };
  }
});

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("SITE_PASSWORD is not set");

    if (!passwordMatches(data.password ?? "", expected)) {
      return { ok: false as const }; // generic failure — reveal nothing more
    }

    const session = await useSession<GateSession>(getSessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });
