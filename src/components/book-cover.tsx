import { useFileUrl } from "@/lib/book-files";
import { cn } from "@/lib/utils";

export function BookCover({
  src,
  resolvedSrc,
  title,
  className,
  fallbackClassName,
}: {
  /** A book-files storage path or URL, resolved internally via useFileUrl. Omit when passing resolvedSrc instead. */
  src?: string | null;
  /** A URL already resolved by the caller (e.g. via a different bucket's own resolver, like catalog covers) — used as-is, skipping useFileUrl. */
  resolvedSrc?: string | null | undefined;
  title: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const fileUrl = useFileUrl(resolvedSrc === undefined ? src : null);
  const url = resolvedSrc !== undefined ? resolvedSrc : fileUrl.data;
  if (url) {
    return <img src={url} alt={`Cover artwork for ${title}`} width={768} height={1152} loading="lazy" className={cn("aspect-[2/3] rounded-lg object-cover shadow-sm", className)} />;
  }
  return (
    <span className={cn("grid aspect-[2/3] place-items-center rounded-lg bg-teal/15 font-heading text-link shadow-sm", className, fallbackClassName)} aria-hidden="true">
      {title.charAt(0) || "?"}
    </span>
  );
}
