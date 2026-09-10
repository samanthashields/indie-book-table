# Branding adjustments: falcon-forward lockups

## Goal
Move the falcon artwork to the front of the brand and pull the Brand Logo / Simple Logo images out of headers, per the requested changes.

## Changes

### 1. Public site header (`src/components/site/public-shell.tsx`)
- Remove the Brand Logo (desktop) and Simple Logo (mobile) images.
- Restore the text lockup: falcon.svg image + "The Indie Book Table" text, linking to the table as today.
- Remove now-unused `brandLogoAsset` / `simpleLogoAsset` imports.

### 2. Mission page (`src/routes/mission.tsx`)
- Replace the falcon.svg decoration above the headline with brand-logo.svg.
- Swap the import accordingly.

### 3. Author's Workshop pages (authenticated shell, `src/components/app-shell.tsx`)
- Replace the open-book icon with falcon.svg wherever the workshop branding/book icon appears.
- Check other authenticated pages that use the book mark (e.g. page headings) and swap consistently.

### 4. Sign in / Create account page (`src/routes/auth.tsx`)
- Remove the Brand Logo image from both the desktop sidebar and the mobile header.
- Restore the text lockup: falcon.svg image + "The Indie Book Table" text.

### 5. Browser tab favicon
- Convert falcon.svg to a real PNG and overwrite `public/favicon.png` (same temporary sharp conversion approach as before, no permanent dependency).
- `src/routes/__root.tsx` already points at `/favicon.png`, so no code change expected there.

## Verification
- `bunx tsgo --noEmit -p tsconfig.json` passes.
- Preview header, mission, auth, and an authenticated workshop page at desktop and mobile widths.
- Confirm the new favicon appears in the browser tab.
