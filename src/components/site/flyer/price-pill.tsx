/** Price shown as a small rotated burst, matching the catalog card style. */
export function PricePill({
  format,
  amount,
}: {
  format: "ebook" | "print" | "item";
  amount: string;
}) {
  const spec = {
    ebook: { label: "eBook", chip: "bg-teal text-ink" },
    print: { label: "Print", chip: "bg-clay text-ink" },
    item: { label: "Item", chip: "bg-clay text-ink" },
  }[format];

  return (
    <span
      className={`inline-flex -rotate-2 items-center gap-1.5 rounded-md border-2 border-ink px-2.5 py-1 text-[0.72rem] font-bold leading-none ${spec.chip}`}
    >
      <span className="text-[0.6rem] font-black uppercase tracking-[0.08em] opacity-80">{spec.label}</span>
      {amount}
    </span>
  );
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return `$${Number(value).toFixed(2)}`;
}
