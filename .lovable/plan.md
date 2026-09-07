# Mobile pass: every page opens and reads well on a phone

I checked the site at phone width (390px). Most pages already fit, but the public pages
(The Table, Issues, Journal, Mission, book and author pages) push about 160px off-screen
because the top menu never collapses. This plan fixes that and then does a page-by-page
sweep so nothing is cut off, cramped, or hard to tap.

## 1. Public header and footer (confirmed problem)

- Replace the always-visible row of links with a compact phone header: logo, then a menu
  button that opens a slide-down panel with The Table, Issues, Journal, Mission and
  Sign in / Author's Workshop. Full link row returns on tablet and wider.
- Shorten the brand text on very narrow screens so it never wraps into the menu button.
- Footer links stack instead of squeezing into one line.

## 2. Page-by-page sweep at phone width

For each page: check nothing runs off the edge, headings and buttons stack sensibly,
and text stays readable.

- The Table, an issue, a book page, an author page, the flyer/magazine reader
- Journal list and a post, Mission
- Sign in
- My Books, My Cycles, Collaborations, Templates, My Submissions, Submit
- A book: overview, details, milestones, team, reflection, end-of-cycle
- Pen chat, Pen buttons
- Help Center, an article, releases, feature request board and detail, support
- Admin: all sections (people, journal, issues, help, submissions, requests,
  support, releases, sitewords, templates, activity, mission, table home)

Recurring fixes applied where needed:
- Header rows with a title plus buttons become a two-column layout that truncates the
  title instead of clipping the buttons.
- Section tab and filter strips scroll sideways with a swipe instead of wrapping badly.
- Wide tables and long lists get a horizontal scroll container.
- Dialogs and drawers use nearly the full screen height with internal scrolling.
- Buttons and links get a comfortable tap size; long titles, emails and links wrap.
- Big display headings step down a size on phones.

## 3. Verification

Automated check that loads every route at 390px wide (and 768px) and reports any page
that scrolls sideways or has content past the edge, plus screenshots of the main pages
so you can see the result. Repeat until every page is clean.

## Notes

- Visual style, colors and content stay as they are — this is layout only.
- No database or behavior changes.
