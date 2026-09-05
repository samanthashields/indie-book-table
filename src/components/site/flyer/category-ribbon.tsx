import { categoryRibbonColor, panelClass } from "@/lib/flyer-theme";

/** Full-width folded banner heading a flyer page. */
export function CategoryRibbon({ category, count }: { category: string; count?: number }) {
  const panel = panelClass(categoryRibbonColor(category));

  return (
    <div className="relative">
      <span aria-hidden="true" className="banner-wide absolute inset-x-0 top-[4px] block h-full bg-cocoa" />
      <div
        className={`banner-wide relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-3 text-center ${panel}`}
      >
        <h2 className="text-[1.35rem] font-bold uppercase leading-none tracking-[0.06em] sm:text-4xl">
          {category}
        </h2>
        {typeof count === "number" && (
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] opacity-85">
            {count} {count === 1 ? "title" : "titles"}
          </span>
        )}
      </div>
    </div>
  );
}
