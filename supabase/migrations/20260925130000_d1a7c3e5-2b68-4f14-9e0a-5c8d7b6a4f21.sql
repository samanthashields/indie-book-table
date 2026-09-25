-- The header no longer holds the recommended tasks button, so update the tour's header copy (only if an admin hasn't edited it).
UPDATE public.cycle_tour_steps
SET body = 'Book details, collaborators, and resources live up here, along with the option to end your cycle when you’re done. The ⋯ menu replays this tour.'
WHERE key = 'header'
  AND body = 'Book details, collaborators, and resources live up here, along with your recommended tasks and the option to end your cycle when you’re done.';
