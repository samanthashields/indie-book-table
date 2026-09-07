# Split auth page branding: "The Indie Book Table" header + "Author's Workshop" form heading

## Goal
Make the `/auth` page feel less cramped by separating the site brand from the workspace name. The public-facing brand becomes **The Indie Book Table**, while the form area clearly labels itself as the **Author's Workshop** sign-in/up flow.

## Changes
- Update `src/routes/auth.tsx`:
  - Change the desktop sidebar logo text and mobile header logo text from the combined name to **"The Indie Book Table"**.
  - Update the page `<title>` and `og:title` from `Sign in — The Indie Book Table's Author's Workshop` to `Sign in — The Indie Book Table`.
  - Replace the form's main heading (`"Welcome back"` / `"Start your account"`) with `"Author's Workshop Sign In"` in sign-in mode and `"Author's Workshop Sign Up"` in create-account mode. Keep the existing subtitle and tabs unchanged.
  - Keep truncation helpers on the brand text for narrow viewports, though the shorter name should now fit without clipping.

## Out of scope
- Other pages or email templates still using the old combined name.
- Structural changes to the auth form or sign-up flow.

## Verification
- Typecheck passes.
- Preview `/auth` on desktop and mobile to confirm the new brand and heading read cleanly in both sign-in and sign-up modes.
