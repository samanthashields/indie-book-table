# Fix Pen page fit and increase floating chat height

## What will change

- Place Pen’s main page and saved-conversation page inside the same Author’s Workshop frame used by the other author pages, restoring consistent navigation, page width, and mobile spacing.
- Make Pen’s page layout shrink safely on narrow screens so the conversation list, chat panel, messages, quick actions, and writing box remain fully visible instead of clipping at the sides.
- Stack and wrap Pen’s page controls appropriately on phones, including conversation actions that currently compete for horizontal space.
- Give the full-page chat a stable, screen-aware height so the message area scrolls internally while the writing box remains accessible.
- Increase the floating Pen window from its current short maximum to a taller screen-aware size, while retaining safe margins on phones and shorter displays.

## Verification

- Check the Pen overview and a saved conversation at desktop and mobile widths for horizontal clipping and overlapping controls.
- Open the floating Pen window on desktop and mobile, confirm it is visibly taller, remains inside the screen, and keeps its header and writing controls reachable.
- Verify the page and floating chat still scroll messages correctly and show no browser errors.

## Technical notes

- Reuse the existing workshop shell and AI chat building blocks; no chat behavior, account rules, or stored conversations will change.
- Apply responsive `min-width`, height, overflow, wrapping, and spacing constraints only where Pen’s layouts need them.