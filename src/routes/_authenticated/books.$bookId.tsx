import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/books/$bookId")({
  component: BookLayout,
});

function BookLayout() {
  return <Outlet />;
}
