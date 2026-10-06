import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, Palette, Pencil, Users } from "lucide-react";

import { PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { getSiteCopy } from "@/lib/catalog.functions";
import { copyPairs, siteCopyValue } from "@/lib/site-copy";

const copyQuery = queryOptions({
  queryKey: ["catalog", "site-copy"],
  queryFn: () => getSiteCopy(),
});

const PRINCIPLE_ACCENTS = ["border-t-amber", "border-t-teal", "border-t-clay"];
const ASK_ICONS = [Pencil, Palette, BookOpen, Users];

export const Route = createFileRoute("/mission")({
  loader: ({ context }) => context.queryClient.ensureQueryData(copyQuery),
  head: () => ({
    meta: [
      { title: "Our mission — The Table" },
      {
        name: "description",
        content:
          "Why The Table exists: a shared table for indie books, where every title gets the same seat and readers see how each book was made.",
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
  const heroImage = value("mission.hero.image");
  const midImage = value("mission.mid.image");
  const askItems = copyPairs(value("mission.ask.items"));

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-6xl">
          {value("mission.headline")}
        </h1>
        <p className="mt-6 text-[1.2rem] leading-relaxed text-foreground/85 sm:text-[1.3rem]">
          {value("mission.body")}
        </p>

        {heroImage && (
          <img
            src={heroImage}
            alt=""
            width={1600}
            height={900}
            className="mt-10 aspect-[16/9] w-full rounded-3xl border border-border/60 object-cover"
          />
        )}

        <section className="mt-14" aria-labelledby="mission-principles">
          <h2 id="mission-principles" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("mission.principles.title")}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n, index) => (
              <li
                key={n}
                className={`rounded-2xl border border-t-4 border-border/70 bg-card p-5 ${PRINCIPLE_ACCENTS[index]}`}
              >
                <h3 className="font-semibold text-foreground">{value(`mission.principle${n}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {value(`mission.principle${n}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="mission-ask">
          <h2 id="mission-ask" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("mission.ask.title")}
          </h2>
          <div className="mt-4 md:grid md:grid-cols-[minmax(0,1fr)_40%] md:items-start md:gap-8">
            <div>
              <p className="leading-7 text-foreground/85">{value("mission.ask.intro")}</p>
              <ul className="mt-6 space-y-4">
                {askItems.map((item, index) => {
                  const Icon = ASK_ICONS[index % ASK_ICONS.length] ?? Pencil;
                  return (
                    <li key={item.label} className="flex gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        {item.text && <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            {midImage && (
              <img
                src={midImage}
                alt=""
                width={800}
                height={800}
                loading="lazy"
                className="mt-8 hidden aspect-[4/5] w-full rounded-3xl border border-border/60 object-cover md:mt-0 md:block"
              />
            )}
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-secondary/60 p-6 text-center sm:p-10" aria-labelledby="mission-cta">
          <h2 id="mission-cta" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("mission.cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-foreground/85">{value("mission.cta.body")}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/issues">{value("mission.cta.primary")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/workshop">{value("mission.cta.secondary")}</Link>
            </Button>
          </div>
        </section>
      </article>
    </PublicShell>
  );
}
