# Update the Pen icon to a vintage feather pen

## Goal
Replace the current `src/assets/pen-mark.png` with a new icon that feels like a friendly, vintage feather pen (quill) while still fitting the warm palette of Author’s Workshop.

## Plan
1. Generate a new 512×512 transparent PNG icon showing a friendly vintage feather quill, with warm ink/cocoa/amber tones that complement the existing app palette.
2. Save it to `src/assets/pen-mark.png`, overwriting the current mark.
3. Confirm the file is in place and the preview picks it up via HMR.

## Technical details
- The icon is used in `src/components/pen/pen-launcher.tsx` and `src/routes/_authenticated/pen.*.tsx`; both reference the same asset import, so no code changes are needed.
- A transparent background is required because the icon floats over both light and dark surfaces.
- No database or server changes are involved.
