import { useCallback, useEffect, useState } from "react";

import type { CatalogBook } from "./catalog-types";

const LIST_KEY = "table:circled";
const GATE_KEY = "table:subscribed";
const EVENT = "table:circled-change";

export type WishlistEntry = {
  id: string;
  title: string;
  author: string;
  ebook_price: number | null;
  print_price: number | null;
};

export function toWishlistEntry(book: CatalogBook): WishlistEntry {
  return {
    id: book.id,
    title: book.title,
    author: book.author_name,
    ebook_price: book.ebook_price,
    print_price: book.print_price,
  };
}

function read(): WishlistEntry[] {
  try {
    const raw = window.sessionStorage.getItem(LIST_KEY);
    const parsed = raw ? (JSON.parse(raw) as WishlistEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: WishlistEntry[]) {
  try {
    window.sessionStorage.setItem(LIST_KEY, JSON.stringify(entries));
  } catch {
    /* private mode: keep the list in memory only */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * The circled-books list. Kept per browser visit — there are no reader
 * accounts, and nothing is stored on our side unless the reader sends it.
 */
export function useWishlist() {
  const [entries, setEntries] = useState<WishlistEntry[]>([]);

  // Read after mount so SSR markup and the first client paint agree.
  useEffect(() => {
    const sync = () => setEntries(read());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = useCallback((entry: WishlistEntry) => {
    const current = read();
    const next = current.some((item) => item.id === entry.id)
      ? current.filter((item) => item.id !== entry.id)
      : [...current, entry];
    write(next);
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setEntries([]);
  }, []);

  const isCircled = useCallback(
    (id: string) => entries.some((entry) => entry.id === id),
    [entries],
  );

  return { entries, toggle, clear, isCircled };
}

/**
 * Circling is a subscriber perk. The unlocked state is remembered per browser
 * after a successful sign-up — a nudge, not access control. Reading is free.
 */
export function useWishlistGate() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(window.localStorage.getItem(GATE_KEY) === "1");
    } catch {
      setUnlocked(false);
    }
  }, []);

  const unlock = useCallback(() => {
    try {
      window.localStorage.setItem(GATE_KEY, "1");
    } catch {
      /* private mode: unlock for this session only */
    }
    setUnlocked(true);
  }, []);

  return { unlocked, unlock };
}
