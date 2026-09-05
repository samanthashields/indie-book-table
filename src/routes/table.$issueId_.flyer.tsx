import { createFileRoute } from "@tanstack/react-router";

import { FlyerReader } from "@/components/site/flyer/flyer-reader";
import { PublicShell } from "@/components/site/public-shell";
import { getIssueCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/table/$issueId/flyer")({
  loader: ({ params }) => getIssueCatalog({ data: { issueId: params.issueId } }),
  head: ({ loaderData }) => {
    const label = loaderData?.issue?.display_label ?? "Issue";
    const title = `${label} flyer — The Indie Table`;
    const description = `Flip through the ${label} flyer: a hand-curated lineup of independently published books, presented like a printed fair flyer.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: IssueFlyerPage,
});

function IssueFlyerPage() {
  const data = Route.useLoaderData();

  return (
    <PublicShell>
      <FlyerReader data={data} />
    </PublicShell>
  );
}
