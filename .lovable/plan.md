# Add uploaded logo, falcon, and AI Pen Coach images to the app

## Goal
Replace the current text-based branding and Pen mascot with the uploaded SVG artwork, while keeping the existing Pen mark in place as requested.

## Assets to ingest
Upload all four SVGs via `lovable-assets` and create `.asset.json` pointers under `src/assets`:
- `Brand Logo.svg` → `src/assets/brand-logo.svg.asset.json`
- `Simple Logo No Stool.svg` → `src/assets/simple-logo.svg.asset.json`
- `Falcon.svg` → `src/assets/falcon.svg.asset.json`
- `AI Pen Coach.svg` → `src/assets/ai-pen-coach.svg.asset.json`

Convert `Simple Logo No Stool.svg` to a 32×32 / 180×180 PNG and overwrite `public/favicon.png` so the favicon stays a real file in `public/`.

## Site header branding
- `src/components/site/public-shell.tsx`
  - Replace the header text `"The Indie Book Table"` with the full Brand Logo image on desktop.
  - Use the Simple Logo for the compact mobile header or as a fallback when the full logo does not fit.
  - Keep the home/table link and accessibility labels.
  - Remove the now-unused `BookOpen` icon import if it is no longer referenced.

## Auth page branding
- `src/routes/auth.tsx`
  - Replace the left-panel BookOpen icon + text lockup with the Brand Logo image.
  - Replace the mobile header BookOpen icon + text lockup with the Brand Logo image.
  - Investigate and fix the current hydration mismatch on `/auth` while the file is open (the mismatch appears around the auth layout wrapper).

## AI Pen Coach — use alongside current Pen
Keep the existing `pen-mark.png.asset.json` Pen icon everywhere it currently appears (floating button, chat avatar, full Pen page).
- Add the AI Pen Coach image as a larger mascot illustration on:
  - `src/routes/_authenticated/pen.index.tsx`: in the paid-plan upsell card and/or page header.
  - `src/components/pen/pen-launcher.tsx`: in the unpaid-state panel or as a decorative header accent.
- The existing small Pen icon remains the primary chat avatar; AI Pen Coach is the companion illustration.

## Pen scribbling thinking state
Replace (or accompany) the current `"Pen is thinking…"` shimmer in `src/components/pen/pen-chat.tsx` with a Pen scribbling/writing animation. Use the uploaded AI Pen Coach image or a small animated/feather-pen illustration, and keep the text label readable and accessible.


## Falcon decoration
Use the Falcon image as a decorative accent. Default placement: hero image on `/mission` (`src/routes/mission.tsx`) or as a standalone decorative figure on the public landing. The plan will confirm the exact page before implementation; if no preference is given, the Mission page hero will be used.

## Verification
- `bunx tsgo --noEmit -p tsconfig.json` passes.
- `bun run build` passes.
- Preview the header, auth page, Pen page/launcher, and Falcon placement at desktop and mobile widths with no console errors.
- Confirm the new favicon loads in the browser tab.
