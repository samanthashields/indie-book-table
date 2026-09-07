import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBooks, type BookSummary } from "@/lib/book-db";

export type PublishedBook = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  publishedOn: string | null;
  publishedLabel: string;
};

export type BadgeId =
  | "first_published"
  | "finished_cycle"
  | "shelf_of_three"
  | "shelf_of_ten"
  | "on_time"
  | "featured"
  | "steady_hand";

export type Badge = {
  id: BadgeId;
  name: string;
  earned: boolean;
  hint: string;
};

/** Reflection completion dates, used to date each published book. */
function useReflectionDates(bookIds: string[]) {
  const key = [...bookIds].sort().join(",");
  return useQuery({
    queryKey: ["achievements", "reflection-dates", key],
    enabled: bookIds.length > 0,
    queryFn: async (): Promise<Record<string, string | null>> => {
      const { data, error } = await supabase.from("reflections").select("book_id, completed_at").in("book_id", bookIds);
      if (error) throw error;
      const map: Record<string, string | null> = {};
      for (const row of data ?? []) map[row.book_id] = row.completed_at;
      return map;
    },
  });
}

/** How many of my submitted books have been chosen for an issue. */
function useFeaturedCount() {
  return useQuery({
    queryKey: ["achievements", "featured-count"],
    queryFn: async (): Promise<number> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return 0;
      const { data: mine, error } = await supabase
        .from("catalog_books")
        .select("id, catalog_authors!inner(user_id)")
        .eq("catalog_authors.user_id", userId);
      if (error) throw error;
      const ids = (mine ?? []).map((row) => row.id);
      if (ids.length === 0) return 0;
      const { count, error: selectionError } = await supabase
        .from("catalog_issue_selections")
        .select("id", { count: "exact", head: true })
        .in("catalog_book_id", ids);
      if (selectionError) throw selectionError;
      return count ?? 0;
    },
  });
}

const monthLabel = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "";

export type Achievements = {
  isLoading: boolean;
  publishedBooks: PublishedBook[];
  publishedCount: number;
  cyclesCompleted: number;
  publishedThisYear: number;
  badges: Badge[];
};

export function useAchievements(): Achievements {
  const { data: books = [], isLoading } = useBooks();
  const mine = books.filter((book: BookSummary) => book.isMine);
  const published = mine.filter((book) => book.shelfStatus === "published");
  const dates = useReflectionDates(mine.map((book) => book.id));
  const featured = useFeaturedCount();

  const publishedBooks: PublishedBook[] = published
    .map((book) => {
      const publishedOn = dates.data?.[book.id] ?? null;
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        publishedOn,
        publishedLabel: monthLabel(publishedOn),
      };
    })
    .sort((a, b) => (b.publishedOn ?? "").localeCompare(a.publishedOn ?? ""));

  const cyclesCompleted = mine.filter((book) => book.status === "complete").length;
  const year = new Date().getFullYear();
  const publishedThisYear = publishedBooks.filter((book) => book.publishedOn && new Date(book.publishedOn).getFullYear() === year).length;

  const onTime = published.some((book) => {
    const completed = dates.data?.[book.id];
    const raw = books.find((row) => row.id === book.id);
    if (!completed || !raw) return false;
    const target = raw.target;
    if (!target || target === "No target date") return false;
    return new Date(completed) <= new Date(new Date(target).getTime() + 24 * 60 * 60 * 1000);
  });

  const steadyHand = mine.some((book) => book.hasCycle && book.nextAction === "All milestones complete");

  const badges: Badge[] = [
    { id: "first_published", name: "First Book Published", earned: publishedBooks.length >= 1, hint: "Publish your first book." },
    { id: "finished_cycle", name: "Finished a Cycle", earned: cyclesCompleted >= 1, hint: "End a book cycle, published or not." },
    { id: "shelf_of_three", name: "Shelf of Three", earned: publishedBooks.length >= 3, hint: "Publish three books." },
    { id: "shelf_of_ten", name: "Shelf of Ten", earned: publishedBooks.length >= 10, hint: "Publish ten books." },
    { id: "on_time", name: "On Time", earned: onTime, hint: "Publish on or before your target date." },
    { id: "featured", name: "Featured at The Table", earned: (featured.data ?? 0) > 0, hint: "Get a book chosen for an issue." },
    { id: "steady_hand", name: "Steady Hand", earned: steadyHand, hint: "Finish every step in a book cycle." },
  ];

  return {
    isLoading: isLoading || dates.isLoading,
    publishedBooks,
    publishedCount: publishedBooks.length,
    cyclesCompleted,
    publishedThisYear,
    badges,
  };
}

const STORAGE_KEY = "seen-achievements";

/** Ids already celebrated on this device. */
export function readSeenBadges(): BadgeId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BadgeId[]) : [];
  } catch {
    return [];
  }
}

export function writeSeenBadges(ids: BadgeId[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}
