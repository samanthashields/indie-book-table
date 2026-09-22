/**
 * Closing character page: a short note from the team, optionally with an
 * illustration. The one block that carries no book data.
 */
export function PersonalityBlock({
  heading,
  body,
  imageUrl,
}: {
  heading: string;
  body: string;
  imageUrl?: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border-2 border-ink bg-ink px-6 py-4 text-center">
        <p className="font-heading text-2xl font-black uppercase tracking-[0.12em] text-on-ink sm:text-4xl">
          {heading}
        </p>
      </div>

      <section className="mt-10 rounded-2xl border-2 border-ink bg-card p-6 text-center sm:p-10">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="mx-auto mb-6 max-h-56 w-auto rounded-xl border-2 border-ink object-contain"
          />
        )}
        {body.split(/\n{2,}/).map((paragraph, index) => (
          <p
            key={index}
            className="mx-auto mt-3 max-w-prose text-[0.98rem] leading-relaxed text-foreground/85 first:mt-0"
          >
            {paragraph}
          </p>
        ))}
      </section>
    </div>
  );
}
