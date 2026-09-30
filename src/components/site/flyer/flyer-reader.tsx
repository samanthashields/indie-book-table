import { useRef, useState, useCallback } from "react";

import type { CatalogIssue } from "@/lib/catalog-types";
import { WishlistBar } from "@/components/site/wishlist-bar";
import { SubscribeGateModal } from "@/components/site/subscribe-gate-modal";
import { useWishlist, useWishlistGate, type WishlistEntry } from "@/lib/wishlist";
import { FlyerSections } from "./flyer-sections";

/**
 * Full-page preview of an issue's design, used by the admin block builder.
 * The public issue page (`/table/$issueId`) renders `FlyerSections` directly,
 * beneath its own title header — this wrapper (with its own cover section,
 * wishlist state, and chrome) is for the standalone admin preview only.
 */
export function FlyerReader({ data }: { data: CatalogIssue }) {
  const { entries, toggle, clear, isCircled } = useWishlist();
  const { unlocked, unlock } = useWishlistGate();
  const [gateOpen, setGateOpen] = useState(false);
  const pendingCircle = useRef<WishlistEntry | null>(null);

  /** Circling is a subscriber perk: the first tap opens the sign-up coupon. */
  const handleCircle = useCallback(
    (entry: WishlistEntry) => {
      if (!unlocked) {
        pendingCircle.current = entry;
        setGateOpen(true);
        return;
      }
      toggle(entry);
    },
    [toggle, unlocked],
  );

  return (
    <div className="min-h-screen bg-paper/60">
      <div className="mx-auto max-w-5xl px-3 pb-16 pt-6 sm:px-6 sm:pt-10">
        <FlyerSections data={data} isCircled={isCircled} onCircle={handleCircle} />
        <WishlistBar entries={entries} onClear={clear} />
      </div>

      <SubscribeGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        onSubscribed={() => {
          unlock();
          setGateOpen(false);
          if (pendingCircle.current) {
            toggle(pendingCircle.current);
            pendingCircle.current = null;
          }
        }}
      />
    </div>
  );
}
