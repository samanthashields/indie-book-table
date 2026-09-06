ALTER TABLE public.books ADD COLUMN IF NOT EXISTS shelf_status text NOT NULL DEFAULT 'idea';
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_shelf_status_check;
ALTER TABLE public.books ADD CONSTRAINT books_shelf_status_check CHECK (shelf_status IN ('idea','writing','illustrations','ready_to_publish','published','on_hold'));