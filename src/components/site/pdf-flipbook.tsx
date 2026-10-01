import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

import { Button } from "@/components/ui/button";

type PageImage = { src: string; width: number; height: number };

const Page = forwardRef<HTMLDivElement, { image: PageImage; label: string }>(function Page(
  { image, label },
  ref,
) {
  return (
    <div ref={ref} className="bg-white">
      <img src={image.src} alt={label} className="h-full w-full select-none object-contain" draggable={false} />
    </div>
  );
});

/** Renders every page of a PDF to an image (client-only) for the flipbook. */
async function renderPdf(url: string, signal: { cancelled: boolean }): Promise<PageImage[]> {
  const pdfjs = await import("pdfjs-dist");
  const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;

  const doc = await pdfjs.getDocument({ url }).promise;
  const pages: PageImage[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    if (signal.cancelled) break;
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, viewport }).promise;
    pages.push({ src: canvas.toDataURL("image/jpeg", 0.85), width: viewport.width, height: viewport.height });
    page.cleanup();
  }
  return pages;
}

export function PdfFlipbook({ url, title }: { url: string; title: string }) {
  const [pages, setPages] = useState<PageImage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);
  const boxRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = useRef<any>(null);

  useEffect(() => {
    const signal = { cancelled: false };
    renderPdf(url, signal)
      .then((result) => !signal.cancelled && setPages(result))
      .catch(() => !signal.cancelled && setFailed(true));
    return () => {
      signal.cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      setBoxWidth(el.clientWidth);
      setViewportHeight(window.innerHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pages]);

  const flip = useCallback((dir: 1 | -1) => {
    const flipper = book.current?.pageFlip();
    if (!flipper) return;
    if (dir === 1) flipper.flipNext();
    else flipper.flipPrev();
  }, []);

  if (failed) {
    return (
      <div className="rounded-2xl border-2 border-ink bg-card p-8 text-center">
        <p className="text-muted-foreground">We couldn't load the flyer here.</p>
        <Button asChild className="mt-4">
          <a href={url} target="_blank" rel="noreferrer">Open the PDF</a>
        </Button>
      </div>
    );
  }

  if (!pages) {
    return (
      <div className="flex h-[min(70vh,40rem)] items-center justify-center rounded-2xl border-2 border-ink bg-card text-muted-foreground">
        Opening the flyer…
      </div>
    );
  }

  const first = pages[0];
  if (!first) return null;
  const portrait = boxWidth < 768;
  // Two-page spread on wide screens, single page on phones.
  // Capped so a full page always fits on screen without scrolling.
  const ratio = first.height / first.width;
  const fitWidth = Math.floor(portrait ? boxWidth : boxWidth / 2);
  const maxHeight = Math.max(360, viewportHeight - 200);
  const pageWidth = Math.max(240, Math.min(fitWidth, Math.floor(maxHeight / ratio)));
  const pageHeight = Math.round(pageWidth * ratio);

  return (
    <div
      className="rounded-2xl border-2 border-ink bg-card p-4 md:p-6"
      role="region"
      aria-label={`${title}, page ${current + 1} of ${pages.length}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") flip(1);
        if (e.key === "ArrowLeft") flip(-1);
      }}
    >
      <div ref={boxRef} className="flex w-full justify-center">
        {boxWidth > 0 && (
          <HTMLFlipBook
            key={`${portrait}-${pageWidth}`}
            ref={book}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={240}
            maxWidth={1200}
            minHeight={300}
            maxHeight={1800}
            usePortrait={portrait}
            showCover
            drawShadow
            maxShadowOpacity={0.35}
            mobileScrollSupport
            flippingTime={700}
            startPage={0}
            startZIndex={0}
            autoSize={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            className=""
            style={{}}
            onFlip={(e: { data: number }) => setCurrent(e.data)}
          >
            {pages.map((image, i) => (
              <Page key={i} image={image} label={`Page ${i + 1}`} />
            ))}
          </HTMLFlipBook>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Button variant="outline" onClick={() => flip(-1)} disabled={current === 0}>
          Previous page
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          Page {current + 1} of {pages.length}
        </span>
        <Button variant="outline" onClick={() => flip(1)} disabled={current >= pages.length - 1}>
          Next page
        </Button>
      </div>
      <p className="mt-2 text-center text-sm">
        <a href={url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Open the PDF in a new tab
        </a>
      </p>
    </div>
  );
}
