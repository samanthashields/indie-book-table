import { useFileUrl } from "@/lib/book-files";
import { cn } from "@/lib/utils";

export function BookCover({ src, title, className, fallbackClassName }: { src: string | null | undefined; title: string; className?: string; fallbackClassName?: string }) {
  const resolved = useFileUrl(src);
  if (resolved.data) {
    return <img src={resolved.data} alt={`Cover artwork for ${title}`} width={768} height={1152} loading="lazy" className={cn("aspect-[2/3] rounded-lg object-cover shadow-sm", className)} />;
  }
  return (
    <span className={cn("grid aspect-[2/3] place-items-center rounded-lg bg-teal/15 font-serif text-primary shadow-sm", className, fallbackClassName)} aria-hidden="true">
      {title.charAt(0) || "?"}
    </span>
  );
}
