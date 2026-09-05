/** Reader-facing tag chips for flyer listings. Presentation only. */
export type TagSpec = { value: string; label: string; icon: string; chip: string };

export const FLYER_TAGS: TagSpec[] = [
  { value: "award_winner", label: "Award winner", icon: "🎖", chip: "bg-teal text-cocoa" },
  { value: "school_themed", label: "School themed", icon: "🍎", chip: "bg-clay text-card" },
  { value: "hidden_gem", label: "Hidden gem", icon: "💎", chip: "bg-inkblue text-card" },
  { value: "needs_love", label: "Needs love", icon: "💛", chip: "bg-amber text-cocoa" },
  { value: "spicy", label: "Spicy", icon: "🌶", chip: "bg-clay/70 text-cocoa" },
  { value: "preorder", label: "Pre-order", icon: "⏳", chip: "bg-leaf text-cocoa" },
  { value: "item", label: "Item (not a book)", icon: "🛍", chip: "bg-clay/80 text-cocoa" },
];

const BY_VALUE = new Map(FLYER_TAGS.map((tag) => [tag.value, tag]));

export function tagSpec(value: string): TagSpec | null {
  return BY_VALUE.get(value) ?? null;
}

export const FORMAT_LEGEND = [
  { label: "eBook", icon: "📘", chip: "bg-teal text-cocoa" },
  { label: "Physical book", icon: "📕", chip: "bg-clay/70 text-cocoa" },
] as const;
