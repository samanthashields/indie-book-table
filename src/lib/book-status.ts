/** Where a book stands on the author's shelf, independent of its cycle progress. */
export const BOOK_STATUSES = [
  { value: "idea", label: "One Day Book Idea" },
  { value: "writing", label: "Book Being Written" },
  { value: "illustrations", label: "Ready for Illustrations" },
  { value: "ready_to_publish", label: "Ready to Publish" },
  { value: "published", label: "Published" },
  { value: "on_hold", label: "Blocked / On-Hold" },
] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number]["value"];

export const BOOK_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  BOOK_STATUSES.map((entry) => [entry.value, entry.label]),
);

export const bookStatusLabel = (value: string | null | undefined) =>
  BOOK_STATUS_LABELS[value ?? "idea"] ?? "One Day Book Idea";

export const bookStatusTone = (value: string | null | undefined): "neutral" | "good" | "warm" | "danger" => {
  if (value === "published") return "good";
  if (value === "on_hold") return "danger";
  if (value === "ready_to_publish" || value === "illustrations") return "warm";
  return "neutral";
};
