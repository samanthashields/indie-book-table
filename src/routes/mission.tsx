import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/site/public-shell";
import { getSiteCopy } from "@/lib/catalog.functions";
import { siteCopyValue } from "@/lib/site-copy";
import brandLogoAsset from "@/assets/brand-logo.svg.asset.json";


const copyQuery = queryOptions({
  queryKey: ["catalog", "site-copy"],
  queryFn: () => getSiteCopy(),
});

const DEFAULT_BODY =
  "The Table is a shared table, not a storefront. Every month we set out a new issue of independently published books and ask how each one was made, so readers can choose with open eyes.";

export const Route = createFileRoute("/mission")({
  loader: ({ context }) => context.queryClient.ensureQueryData(copyQuery),
  head: () => ({
    meta: [
      { title: "Our mission — The Table" },
      {
        name: "description",
        content:
          "Why The Table exists: a shared table for indie authors and readers, open to every author's journey, awards or not.",
      },
      { property: "og:title", content: "Our mission — The Table" },
      {
        property: "og:description",
        content:
          "A shared table, not a storefront. We ask how a book was made so readers can choose with open eyes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const { data } = useSuspenseQuery(copyQuery);
  const copy = data?.copy ?? {};
  const value = (key: string) => siteCopyValue(copy, key);
  const taglines = (copy["mission.taglines"] ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const heroImage = value("mission.hero.image");
  const midImage = value("mission.mid.image");

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center">
          <img
            src={falconAsset.url}
            alt=""
            width={2000}
            height={2000}
            className="max-h-32 w-auto object-contain"
          />
        </div>

        <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-6xl">
          {value("mission.headline")}
        </h1>

        {heroImage && (
          <img
            src={heroImage}
            alt=""
            width={1600}
            height={900}
            className="mt-8 aspect-[16/9] w-full rounded-3xl border border-border/60 object-cover"
          />
        )}


        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-xs sm:p-10">
          <p className="text-[1.05rem] leading-[1.85] text-foreground/85">
            {copy["mission.body"] ?? DEFAULT_BODY}
          </p>
        </div>

        {midImage && (
          <img
            src={midImage}
            alt=""
            width={800}
            height={800}
            loading="lazy"
            className="mt-10 aspect-[4/3] w-full rounded-3xl border border-border/60 object-cover"
          />
        )}

        {taglines.length > 0 && (
          <>
            <h2 className="mt-12 font-serif text-2xl text-cocoa">{value("mission.quotes.title")}</h2>
            <div className="mt-6 space-y-9">
              {taglines.map((line, index) => (
                <blockquote
                  key={line}
                  className={`border-l-4 border-amber pl-6 font-serif text-2xl italic leading-snug text-cocoa sm:text-3xl ${
                    index % 2 === 0 ? "-rotate-[0.6deg]" : "rotate-[0.6deg]"
                  }`}
                >
                  “{line}”
                </blockquote>
              ))}
            </div>
          </>
        )}
      </article>
    </PublicShell>
  );
}
