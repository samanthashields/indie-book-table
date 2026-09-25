/**
 * Pen's General knowledge pack — shared by every book, every genre. Used in both the ongoing-chat
 * prompt (pen.server.ts) and the plan-generation prompt (book-plan-schema.ts) so the two never drift.
 * Genre packs (Memoir, Nonfiction / How-To, Picture Book) are staged until those templates are
 * verified live; Fiction needs no add-ons beyond this pack.
 */
export const penGeneralPack = `Coaching knowledge (use it to teach, in Pen's voice — never recite it as a list, and never guarantee sales or rankings):
- Idea capture and shaping: get a raw idea, memory or premise onto the page before imposing structure. A loose outline leaves room to discover; a rigid one guards against drift. Fiction, memoir and nonfiction need different amounts of upfront structure (nonfiction's outline is often its real structure).
- Drafting: a "skeletal" first pass — short versions of every chapter or spread — surfaces structural problems before heavy writing begins.
- Revision: layered, iterative passes deepen a chapter and surface what a single pass misses. A print-and-markup pass with a red pen catches what screen-editing doesn't; entering the handwritten markup back into the digital manuscript is its own step, so sticky-note ideas aren't lost.
- Beta readers: an early spot-check read (1–2 readers, a few chapters) is different from a full structured beta survey with specific questions, ideally with each reader given a different segment. Weighing feedback — deciding what to act on and what to set aside — is separate from collecting it; the author keeps the creative veto.
- AI boundaries: AI can be a second pair of eyes, a sounding board, and a way to catch inconsistencies. It should not write the book, replace the author's judgment, or substitute for a professional pass when budget allows.
- Editing and hiring: copyedit vs. developmental edit vs. proofread; DIY vs. hire per pass depends on budget and stakes. A genuine, uninterrupted full read-through — not a checklist — is what closes out a phase.
- Locking the manuscript: after the lock, only formatting changes (trim, fonts, layout), no text changes.
- Front and back matter: acknowledgments, dedication, about the author, table of contents, prologue/epilogue. Draft the content early; page-number accuracy doesn't matter until Production.
- Back-cover copy and blurb: retail-facing description copy is its own writing task, and its length affects cover and sleeve layout.
- Trim size and cover format: hardcover vs. paperback constrains trim options and page-count minimums and maximums — decide before interior formatting begins.
- Interior formatting: start from the platform's template and work in a copy of the locked manuscript. Headers, footers and page numbers behave through template sections; final page numbers often shift again after upload and preview, so the table of contents is finalized last.
- Cover design: cover and interior design run in parallel with formatting. Expect bleed-line issues and several iterations before a platform approves the files.
- KDP and IngramSpark: creating a draft listing triggers the automated format-check; uploads often take several attempts; running both in parallel means each has its own final check.
- ISBNs: free vs. purchased is a real decision — switching later means redoing every file the ISBN touches. One ISBN per print format; the KDP ebook uses a free ASIN and needs none, while IngramSpark's ebook needs its own.
- Pre-orders: a pre-order listing on Amazon requires the IngramSpark and KDP listings to share the same ISBN, and linking them takes days or weeks — plan the lead time.
- Ebook file: build it with KDP's own tool (Kindle Create); no separate ISBN is needed there.
- Pricing: royalty structures differ across platforms and printing cost sets the floor — price each format on each platform deliberately.
- Proof copies: hand-check a physical proof from each platform even after the automated check passes. Review proofs are stamped "not for resale"; sellable author copies are a separate, later order that needs 3–4 weeks of lead time before events.
- Publication date: a tentative date, set early, seeds the timeline; the firmed-up date in Pre-Launch is the harder commitment.
- List-building: it starts lightly in Writing & Development (a sign-up page, behind-the-scenes posts) and grows in intensity through Pre-Launch.
- Author website: a minimum-viable site has book pages, a sign-up form and coming-soon or pre-order placeholders; on publication day, flip "Pre-Order" to "Now Available" the same day.
- ARC teams vs. beta readers: beta readers shape the book before it's finished; an ARC team gets the finished book free in exchange for honest launch-day reviews, and needs the longest lead time in Pre-Launch.
- Reviews: ARC-reader reviews are different from editorial reviews (professional reviewers, journalists, bloggers, authors in the genre), which can appear in retail editorial-review sections or as blurbs.
- Launch day: verify each live listing and link before announcing; announce in a repeatable sequence (blog post, social, email list).
- After launch: shift messaging from anticipation to reader-response — same channels, different energy.
- Post-launch growth channels: in-person and local events and markets, reviews and testimonials, promotions and paid ads (ebook discounts, promo sites, repurposed content), podcasts and media, community and newsletters, and starting the next book. The "Post Launch Recommended Tasks (optional)" checklist is the concrete menu; none of it is required.`;
