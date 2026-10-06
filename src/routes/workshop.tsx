import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { getSiteCopy } from "@/lib/catalog.functions";
import { captureEvent } from "@/lib/posthog";
import { copyLines, copyPairs, siteCopyValue } from "@/lib/site-copy";
import penMarkAsset from "@/assets/pen-mark.png.asset.json";

const copyQuery = queryOptions({
  queryKey: ["catalog", "site-copy"],
  queryFn: () => getSiteCopy(),
});

type CtaLocation = "hero" | "pricing" | "closing";

const trackCta = (location: CtaLocation) => () => captureEvent("workshop_page_cta_clicked", { location });

const TITLE = "Author's Workshop — The Table";
const DESCRIPTION =
  "Plan, write, and launch your indie book one phase at a time, with genre templates, your publishing team, and Pen, your book coach.";

export const Route = createFileRoute("/workshop")({
  loader: ({ context }) => context.queryClient.ensureQueryData(copyQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkshopPage,
});

function SignUpButton({
  location,
  children,
  variant,
}: {
  location: CtaLocation;
  children: string;
  variant?: "default" | "outline";
}) {
  return (
    <Button asChild size="lg" variant={variant}>
      <Link to="/auth" search={{ mode: "signup" }} onClick={trackCta(location)}>
        {children}
      </Link>
    </Button>
  );
}

function WorkshopPage() {
  const { data } = useSuspenseQuery(copyQuery);
  const copy = data?.copy ?? {};
  const value = (key: string) => siteCopyValue(copy, key);
  const heroImage = value("workshop.hero.image");
  const phases = copyPairs(value("workshop.phases.items"));
  const features = [1, 2, 3, 4].map((n) => ({
    title: value(`workshop.feature${n}.title`),
    body: value(`workshop.feature${n}.body`),
    image: value(`workshop.feature${n}.image`),
  }));
  const plans = (["free", "paid"] as const).map((id) => ({
    id,
    name: value(`workshop.plan.${id}.name`),
    price: value(`workshop.plan.${id}.price`).trim(),
    items: copyLines(value(`workshop.plan.${id}.items`)),
  }));

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl">
        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl">
              {value("workshop.hero.title")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-foreground/85">{value("workshop.hero.body")}</p>
            <div className="mt-7">
              <SignUpButton location="hero">{value("workshop.hero.cta")}</SignUpButton>
              <p className="mt-3 text-sm">
                <Link to="/auth" className="font-semibold underline underline-offset-4 hover:text-foreground">
                  {value("workshop.hero.signin")}
                </Link>
              </p>
            </div>
          </div>
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              width={1200}
              height={900}
              className="aspect-[4/3] w-full rounded-3xl border border-border/60 object-cover"
            />
          )}
        </section>

        <section className="mt-16" aria-labelledby="workshop-phases">
          <h2 id="workshop-phases" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("workshop.phases.title")}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-foreground/85">{value("workshop.phases.intro")}</p>
          <ol className="mt-8 grid gap-6 lg:grid-cols-6 lg:gap-4">
            {phases.map((phase, index) => (
              <li
                key={phase.label}
                className="relative border-l-2 border-border pl-6 lg:border-l-0 lg:border-t-2 lg:pl-0 lg:pt-6"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[0.8rem] top-0 grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground lg:-top-3 lg:left-0"
                >
                  {index + 1}
                </span>
                <h3 className="font-semibold text-foreground">{phase.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{phase.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16" aria-labelledby="workshop-features">
          <h2 id="workshop-features" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("workshop.features.title")}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const isPenMark = feature.image === penMarkAsset.url;
              return (
                <li key={feature.title} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                  {feature.image && (
                    <img
                      src={feature.image}
                      alt=""
                      loading="lazy"
                      className={
                        isPenMark
                          ? "h-40 w-full bg-secondary/60 object-contain p-6"
                          : "aspect-[16/9] w-full object-cover"
                      }
                    />
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-16 rounded-3xl border border-border/70 bg-card p-6 sm:p-10" aria-labelledby="workshop-bridge">
          <h2 id="workshop-bridge" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("workshop.bridge.title")}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-foreground/85">{value("workshop.bridge.body")}</p>
          <p className="mt-4">
            <Link to="/table" className="font-semibold underline underline-offset-4 hover:text-foreground">
              {value("workshop.bridge.link")}
            </Link>
          </p>
        </section>

        <section className="mt-16" aria-labelledby="workshop-plans">
          <h2 id="workshop-plans" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("workshop.plans.title")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border bg-card p-6 ${
                  plan.id === "paid" ? "border-primary/40" : "border-border/70"
                }`}
              >
                <h3 className="font-heading text-xl text-foreground">{plan.name}</h3>
                {plan.price && <p className="mt-1 text-lg font-semibold text-foreground">{plan.price}</p>}
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6">
                      <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <SignUpButton location="pricing" variant={plan.id === "paid" ? "outline" : "default"}>
                    {value("workshop.plans.cta")}
                  </SignUpButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-secondary/60 p-6 text-center sm:p-10" aria-labelledby="workshop-closing">
          <h2 id="workshop-closing" className="font-heading text-2xl text-cocoa sm:text-3xl">
            {value("workshop.closing.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-foreground/85">{value("workshop.closing.body")}</p>
          <div className="mt-6">
            <SignUpButton location="closing">{value("workshop.closing.cta")}</SignUpButton>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
