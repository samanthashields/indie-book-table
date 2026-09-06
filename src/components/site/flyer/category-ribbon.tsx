import { accentBarClass, categoryRibbonColor } from "@/lib/flyer-theme";

/** Big fair-poster headline bar sitting at the top of a flyer page. */
export function CategoryRibbon({ category, count }: { category: string; count?: number }) {
  const bar = accentBarClass(categoryRibbonColor(category));

  return (
    <div className="poster-slant relative overflow-hidden rounded-2xl bg-cocoa px-5 py-4 sm:px-8 sm:py-6">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-3 ${bar}`} />
      <div className="poster-unslant flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-serif text-[1.9rem] font-black uppercase leading-none tracking-[0.02em] text-paper sm:text-5xl">
          {category}
        </h2>
        {typeof count === "number" && (
          <span className="rounded-full bg-paper px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-cocoa">
            {count} {count === 1 ? "title" : "titles"}
          </span>
        )}
      </div>
    </div>
  );
}
