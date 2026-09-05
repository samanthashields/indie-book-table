/** Price printed the way the paper flyer does it: icon chip + heavy amount. */
export function PricePill({
  format,
  amount,
}: {
  format: "ebook" | "print" | "item";
  amount: string;
}) {
  const spec = {
    ebook: { icon: "📘", chip: "bg-teal text-cocoa", label: "eBook" },
    print: { icon: "📕", chip: "bg-clay/70 text-cocoa", label: "Physical book" },
    item: { icon: "🛍", chip: "bg-clay/80 text-cocoa", label: "Item" },
  }[format];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={`inline-flex size-6 items-center justify-center rounded-full border-2 border-cocoa text-[0.72rem] leading-none ${spec.chip}`}
      >
        {spec.icon}
      </span>
      <span className="sr-only">{spec.label}: </span>
      <span className="text-[0.9rem] font-bold leading-none text-cocoa">{amount}</span>
    </span>
  );
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return `$${Number(value).toFixed(2)}`;
}
