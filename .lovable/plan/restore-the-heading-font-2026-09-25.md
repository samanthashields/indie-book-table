# Restore the heading font

## Changes
- Register `heading` in Tailwind’s font namespace so every existing `font-heading` class generates CSS.
- Load Inter alongside the existing display font so headings use the intended typeface rather than a system fallback.
- Verify the generated rule, computed heading font, preview build, and then close the monitoring finding.

## Technical details
- Replace the incorrect `--color-font-heading` mapping with `--font-heading` inside `@theme inline`.
- Remove the ineffective duplicate variable from the root color-token block.
- Extend the existing Google Fonts stylesheet request; no component changes are needed.
