import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old flyer links now open the issue page, which renders the flyer itself. */
export const Route = createFileRoute("/table/$issueId_/flyer")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/table/$issueId", params: { issueId: params.issueId }, statusCode: 301 });
  },
});
