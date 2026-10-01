import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Old flyer links now open the issue page, which renders the flyer itself. */
export const Route = createFileRoute("/table/$issueId_/flyer")({
  component: FlyerRedirect,
});

function FlyerRedirect() {
  const { issueId } = Route.useParams();
  return <Navigate to="/table/$issueId" params={{ issueId }} replace />;
}
