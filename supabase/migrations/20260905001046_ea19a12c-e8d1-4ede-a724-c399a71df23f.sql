-- Enums
DO $$ BEGIN CREATE TYPE public.target_audience AS ENUM ('adult','new_adult','young_adult','middle_grade','picture_book'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.ai_contribution AS ENUM ('none','some','significant'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.catalog_book_status AS ENUM ('submitted','under_review','added_to_database','removed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.issue_status AS ENUM ('draft','published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.post_status AS ENUM ('draft','published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin helper bridging to this app's role system
CREATE OR REPLACE FUNCTION public.is_catalog_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

-- Tables
CREATE TABLE public.catalog_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  instagram_handle text,
  website text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_author_id uuid NOT NULL REFERENCES public.catalog_authors(id) ON DELETE CASCADE,
  book_cycle_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  title text NOT NULL,
  pen_name text,
  target_audience public.target_audience NOT NULL DEFAULT 'adult',
  genre text,
  explicit_content boolean NOT NULL DEFAULT false,
  hook text,
  editors text,
  illustrators text,
  cover_designer text,
  ai_writing_contribution public.ai_contribution NOT NULL DEFAULT 'none',
  ai_art_contribution public.ai_contribution NOT NULL DEFAULT 'none',
  ebook_price numeric(10,2),
  print_price numeric(10,2),
  cover_image_url text,
  awards_reviews_text text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  status public.catalog_book_status NOT NULL DEFAULT 'submitted',
  removal_reason text,
  times_featured_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT catalog_books_tags_allowed CHECK (tags <@ ARRAY['award_winner','school_themed','hidden_gem','needs_love','spicy','preorder','item']::text[])
);
CREATE INDEX catalog_books_author_idx ON public.catalog_books(catalog_author_id);

CREATE TABLE public.catalog_purchase_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_book_id uuid NOT NULL REFERENCES public.catalog_books(id) ON DELETE CASCADE,
  platform_label text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX catalog_purchase_links_book_idx ON public.catalog_purchase_links(catalog_book_id);

CREATE TABLE public.catalog_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_month date NOT NULL UNIQUE,
  display_label text NOT NULL,
  status public.issue_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_issue_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_book_id uuid NOT NULL REFERENCES public.catalog_books(id) ON DELETE CASCADE,
  issue_id uuid NOT NULL REFERENCES public.catalog_issues(id) ON DELETE CASCADE,
  category text NOT NULL,
  is_spotlight boolean NOT NULL DEFAULT false,
  spotlight_blurb text,
  spotlight_post_id uuid,
  order_index integer NOT NULL DEFAULT 0,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE (catalog_book_id, issue_id)
);
CREATE INDEX catalog_issue_selections_issue_idx ON public.catalog_issue_selections(issue_id);
CREATE INDEX catalog_issue_selections_book_idx ON public.catalog_issue_selections(catalog_book_id);
CREATE UNIQUE INDEX catalog_one_spotlight_per_issue ON public.catalog_issue_selections (issue_id, category) WHERE is_spotlight;

CREATE TABLE public.catalog_issue_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.catalog_issues(id) ON DELETE CASCADE,
  category text NOT NULL,
  quota integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, category)
);

CREATE TABLE public.catalog_editorial_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  active_issue_id uuid REFERENCES public.catalog_issues(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_issue_themes (
  issue_id uuid PRIMARY KEY REFERENCES public.catalog_issues(id) ON DELETE CASCADE,
  preset text NOT NULL DEFAULT 'classic',
  border_pattern text NOT NULL DEFAULT 'hearts',
  cover_image_url text,
  cover_headline text,
  cover_tagline text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_issue_page_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.catalog_issues(id) ON DELETE CASCADE,
  category text NOT NULL,
  ground_color text,
  background_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, category)
);

CREATE TABLE public.catalog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_image_url text,
  status public.post_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX catalog_posts_published_idx ON public.catalog_posts (published_at DESC);

CREATE TABLE public.catalog_site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  catalog_opt_in boolean NOT NULL DEFAULT false,
  blog_opt_in boolean NOT NULL DEFAULT false,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX catalog_subscribers_email_lower_key ON public.catalog_subscribers (lower(email));

CREATE TABLE public.catalog_wishlist_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX catalog_wishlist_send_log_email_idx ON public.catalog_wishlist_send_log (email, sent_at DESC);

-- Grants
GRANT SELECT ON public.catalog_authors TO anon;
GRANT SELECT, INSERT, UPDATE ON public.catalog_authors TO authenticated;
GRANT ALL ON public.catalog_authors TO service_role;

GRANT SELECT ON public.catalog_books TO anon;
GRANT SELECT, INSERT, UPDATE ON public.catalog_books TO authenticated;
GRANT ALL ON public.catalog_books TO service_role;

GRANT SELECT ON public.catalog_purchase_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_purchase_links TO authenticated;
GRANT ALL ON public.catalog_purchase_links TO service_role;

GRANT SELECT ON public.catalog_issues TO anon;
GRANT SELECT, INSERT, UPDATE ON public.catalog_issues TO authenticated;
GRANT ALL ON public.catalog_issues TO service_role;

GRANT SELECT ON public.catalog_issue_selections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_issue_selections TO authenticated;
GRANT ALL ON public.catalog_issue_selections TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_issue_quotas TO authenticated;
GRANT ALL ON public.catalog_issue_quotas TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.catalog_editorial_settings TO authenticated;
GRANT ALL ON public.catalog_editorial_settings TO service_role;

GRANT SELECT ON public.catalog_issue_themes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_issue_themes TO authenticated;
GRANT ALL ON public.catalog_issue_themes TO service_role;

GRANT SELECT ON public.catalog_issue_page_themes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_issue_page_themes TO authenticated;
GRANT ALL ON public.catalog_issue_page_themes TO service_role;

GRANT SELECT ON public.catalog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_posts TO authenticated;
GRANT ALL ON public.catalog_posts TO service_role;

GRANT SELECT ON public.catalog_site_content TO anon;
GRANT SELECT, INSERT, UPDATE ON public.catalog_site_content TO authenticated;
GRANT ALL ON public.catalog_site_content TO service_role;

GRANT SELECT, UPDATE, DELETE ON public.catalog_subscribers TO authenticated;
GRANT ALL ON public.catalog_subscribers TO service_role;
GRANT ALL ON public.catalog_wishlist_send_log TO service_role;

-- Enable RLS
ALTER TABLE public.catalog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_purchase_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_issue_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_issue_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_editorial_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_issue_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_issue_page_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_wishlist_send_log ENABLE ROW LEVEL SECURITY;

-- Publication helpers
CREATE OR REPLACE FUNCTION public.catalog_issue_is_published(_issue_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.catalog_issues i WHERE i.id = _issue_id AND i.status = 'published')
$$;

CREATE OR REPLACE FUNCTION public.catalog_book_is_published(_book_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_issue_selections s
    JOIN public.catalog_issues i ON i.id = s.issue_id
    WHERE s.catalog_book_id = _book_id AND i.status = 'published'
  )
$$;

CREATE OR REPLACE FUNCTION public.catalog_author_is_published(_author_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_books b
    JOIN public.catalog_issue_selections s ON s.catalog_book_id = b.id
    JOIN public.catalog_issues i ON i.id = s.issue_id
    WHERE b.catalog_author_id = _author_id AND i.status = 'published'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_my_catalog_author(_author_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.catalog_authors a WHERE a.id = _author_id AND a.user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.owns_catalog_book(_book_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_books b
    JOIN public.catalog_authors a ON a.id = b.catalog_author_id
    WHERE b.id = _book_id AND a.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.catalog_issue_contains_my_book(_issue_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_issue_selections s
    JOIN public.catalog_books b ON b.id = s.catalog_book_id
    JOIN public.catalog_authors a ON a.id = b.catalog_author_id
    WHERE s.issue_id = _issue_id AND a.user_id = auth.uid()
  )
$$;

-- Policies: authors
CREATE POLICY "Published catalog authors are public" ON public.catalog_authors
  FOR SELECT TO anon, authenticated USING (public.catalog_author_is_published(id));
CREATE POLICY "Authors view their own catalog profile" ON public.catalog_authors
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all catalog authors" ON public.catalog_authors
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Authors create their own catalog profile" ON public.catalog_authors
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_catalog_admin());
CREATE POLICY "Authors update their own catalog profile" ON public.catalog_authors
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_catalog_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_catalog_admin());

-- Policies: books
CREATE POLICY "Books in published issues are public" ON public.catalog_books
  FOR SELECT TO anon, authenticated USING (public.catalog_book_is_published(id));
CREATE POLICY "Authors view their own catalog books" ON public.catalog_books
  FOR SELECT TO authenticated USING (public.is_my_catalog_author(catalog_author_id));
CREATE POLICY "Admins view all catalog books" ON public.catalog_books
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Authors submit their own catalog books" ON public.catalog_books
  FOR INSERT TO authenticated WITH CHECK (public.is_my_catalog_author(catalog_author_id) OR public.is_catalog_admin());
CREATE POLICY "Authors and admins update catalog books" ON public.catalog_books
  FOR UPDATE TO authenticated USING (public.is_my_catalog_author(catalog_author_id) OR public.is_catalog_admin())
  WITH CHECK (public.is_my_catalog_author(catalog_author_id) OR public.is_catalog_admin());

-- Policies: purchase links
CREATE POLICY "Links of published books are public" ON public.catalog_purchase_links
  FOR SELECT TO anon, authenticated USING (public.catalog_book_is_published(catalog_book_id));
CREATE POLICY "Authors view their own book links" ON public.catalog_purchase_links
  FOR SELECT TO authenticated USING (public.owns_catalog_book(catalog_book_id) OR public.is_catalog_admin());
CREATE POLICY "Authors add links to their own books" ON public.catalog_purchase_links
  FOR INSERT TO authenticated WITH CHECK (public.owns_catalog_book(catalog_book_id) OR public.is_catalog_admin());
CREATE POLICY "Authors update links on their own books" ON public.catalog_purchase_links
  FOR UPDATE TO authenticated USING (public.owns_catalog_book(catalog_book_id) OR public.is_catalog_admin())
  WITH CHECK (public.owns_catalog_book(catalog_book_id) OR public.is_catalog_admin());
CREATE POLICY "Authors delete links on their own books" ON public.catalog_purchase_links
  FOR DELETE TO authenticated USING (public.owns_catalog_book(catalog_book_id) OR public.is_catalog_admin());

-- Policies: issues and selections
CREATE POLICY "Published issues are public" ON public.catalog_issues
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Authors view issues containing their books" ON public.catalog_issues
  FOR SELECT TO authenticated USING (public.catalog_issue_contains_my_book(id));
CREATE POLICY "Admins view all issues" ON public.catalog_issues
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Admins create issues" ON public.catalog_issues
  FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins update issues" ON public.catalog_issues
  FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());

CREATE POLICY "Selections in published issues are public" ON public.catalog_issue_selections
  FOR SELECT TO anon, authenticated USING (public.catalog_issue_is_published(issue_id));
CREATE POLICY "Authors view selections of their books" ON public.catalog_issue_selections
  FOR SELECT TO authenticated USING (public.owns_catalog_book(catalog_book_id));
CREATE POLICY "Admins view all selections" ON public.catalog_issue_selections
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Admins create selections" ON public.catalog_issue_selections
  FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins update selections" ON public.catalog_issue_selections
  FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins delete selections" ON public.catalog_issue_selections
  FOR DELETE TO authenticated USING (public.is_catalog_admin());

CREATE POLICY "Admins manage quotas" ON public.catalog_issue_quotas
  FOR ALL TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins read editorial settings" ON public.catalog_editorial_settings
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Admins set editorial settings" ON public.catalog_editorial_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins change editorial settings" ON public.catalog_editorial_settings
  FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());

CREATE POLICY "Themes of published issues are public" ON public.catalog_issue_themes
  FOR SELECT TO anon, authenticated USING (public.catalog_issue_is_published(issue_id));
CREATE POLICY "Admins manage issue themes" ON public.catalog_issue_themes
  FOR ALL TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());

CREATE POLICY "Page themes of published issues are public" ON public.catalog_issue_page_themes
  FOR SELECT TO anon, authenticated USING (public.catalog_issue_is_published(issue_id));
CREATE POLICY "Admins manage page themes" ON public.catalog_issue_page_themes
  FOR ALL TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());

-- Policies: posts and site content
CREATE POLICY "Published posts are public" ON public.catalog_posts
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins view all posts" ON public.catalog_posts
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Admins create posts" ON public.catalog_posts
  FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins update posts" ON public.catalog_posts
  FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins delete posts" ON public.catalog_posts
  FOR DELETE TO authenticated USING (public.is_catalog_admin());

CREATE POLICY "Site content is public" ON public.catalog_site_content
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write site content" ON public.catalog_site_content
  FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins update site content" ON public.catalog_site_content
  FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());

CREATE POLICY "Admins view subscribers" ON public.catalog_subscribers
  FOR SELECT TO authenticated USING (public.is_catalog_admin());
CREATE POLICY "Admins update subscribers" ON public.catalog_subscribers
  FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins delete subscribers" ON public.catalog_subscribers
  FOR DELETE TO authenticated USING (public.is_catalog_admin());

-- updated_at triggers
CREATE TRIGGER update_catalog_authors_updated_at BEFORE UPDATE ON public.catalog_authors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_books_updated_at BEFORE UPDATE ON public.catalog_books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_issues_updated_at BEFORE UPDATE ON public.catalog_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_issue_quotas_updated_at BEFORE UPDATE ON public.catalog_issue_quotas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_issue_themes_updated_at BEFORE UPDATE ON public.catalog_issue_themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_issue_page_themes_updated_at BEFORE UPDATE ON public.catalog_issue_page_themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_posts_updated_at BEFORE UPDATE ON public.catalog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_site_content_updated_at BEFORE UPDATE ON public.catalog_site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed content
INSERT INTO public.catalog_editorial_settings (id, active_issue_id) VALUES (true, NULL);

INSERT INTO public.catalog_authors (id, name, email, instagram_handle, website) VALUES
  ('11111111-1111-1111-1111-111111111111','Mireille Okonjo','mireille@example.com','@mireillewrites','https://mireilleokonjo.example.com'),
  ('22222222-2222-2222-2222-222222222222','Desmond Hale','desmond@example.com','@haletypes',NULL),
  ('33333333-3333-3333-3333-333333333333','Junie Park','junie@example.com','@juniedraws','https://juniepark.example.com');

INSERT INTO public.catalog_issues (id, issue_month, display_label, status, published_at) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','2026-08-01','August 2026','published', now());

UPDATE public.catalog_editorial_settings SET active_issue_id = 'aaaaaaaa-0000-0000-0000-000000000001' WHERE id;

INSERT INTO public.catalog_issue_themes (issue_id, preset, border_pattern, cover_headline, cover_tagline) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','classic','hearts','The Table','August 2026 — five indie books worth your shelf');

INSERT INTO public.catalog_books (id, catalog_author_id, title, pen_name, target_audience, genre, explicit_content, hook, editors, illustrators, cover_designer, ai_writing_contribution, ai_art_contribution, ebook_price, print_price, awards_reviews_text, tags, status, times_featured_count) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','The Salt Almanac',NULL,'adult','Literary Fiction',false,'A lighthouse keeper catalogs every ship she fails to save — until one of them writes back.','R. Adeyemi',NULL,'Studio Kettle','none','none',6.99,17.00,'Longlisted, Indie Fiction Prize 2025',ARRAY['award_winner']::text[],'added_to_database',2),
  ('bbbbbbbb-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','Nine Kinds of Weather','D. R. Hale','new_adult','Speculative Fiction',false,'In a city where moods are forecast nightly, one girl keeps showing up as static.','L. Mbeki',NULL,'Desmond Hale','none','some',4.99,14.50,NULL,ARRAY['hidden_gem']::text[],'added_to_database',0),
  ('bbbbbbbb-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Grandmother Machine',NULL,'adult','Magical Realism',true,'Her grandmother left behind a sewing machine that stitches memories back into people.','R. Adeyemi',NULL,'Studio Kettle','none','none',5.50,16.00,'"Quietly devastating." — Small Press Review',ARRAY['spicy']::text[],'added_to_database',1),
  ('bbbbbbbb-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','Bramble & the Paper Moon',NULL,'middle_grade','Adventure',false,'A hedgehog inventor builds a moon out of newspaper — and the tide believes it.',NULL,'Junie Park','Junie Park','none','none',3.99,12.00,'Starred review from Tiny Shelf Weekly',ARRAY['school_themed']::text[],'added_to_database',0),
  ('bbbbbbbb-0000-0000-0000-000000000005','33333333-3333-3333-3333-333333333333','The Lantern Kids',NULL,'young_adult','Mystery',false,'Five teens, one blackout summer, and a lantern that only lights near a liar.','K. Ferreira',NULL,'Studio Kettle','none','none',4.49,13.25,NULL,ARRAY['needs_love']::text[],'added_to_database',3);

INSERT INTO public.catalog_purchase_links (catalog_book_id, platform_label, url) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001','Bookshop.org','https://bookshop.org/example/salt-almanac'),
  ('bbbbbbbb-0000-0000-0000-000000000001','Kobo','https://kobo.com/example/salt-almanac'),
  ('bbbbbbbb-0000-0000-0000-000000000002','Author store','https://example.com/nine-kinds-of-weather'),
  ('bbbbbbbb-0000-0000-0000-000000000002','Amazon','https://amazon.com/dp/example2'),
  ('bbbbbbbb-0000-0000-0000-000000000003','Bookshop.org','https://bookshop.org/example/grandmother-machine'),
  ('bbbbbbbb-0000-0000-0000-000000000004','Author store','https://example.com/bramble-paper-moon'),
  ('bbbbbbbb-0000-0000-0000-000000000004','Bookshop.org','https://bookshop.org/example/bramble-paper-moon'),
  ('bbbbbbbb-0000-0000-0000-000000000005','Kobo','https://kobo.com/example/lantern-kids');

INSERT INTO public.catalog_issue_selections (catalog_book_id, issue_id, category, is_spotlight, spotlight_blurb, order_index, published_at) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Spotlight Fiction',true,'Our pick of the month: a quiet, salt-stung debut.',0, now()),
  ('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001','Spotlight Fiction',false,NULL,1, now()),
  ('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000001','Spotlight Fiction',false,NULL,2, now()),
  ('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000001','Young Readers',true,NULL,0, now()),
  ('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000001','Young Readers',false,NULL,1, now());

INSERT INTO public.catalog_issue_quotas (issue_id, category, quota) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','Spotlight Fiction',3),
  ('aaaaaaaa-0000-0000-0000-000000000001','Young Readers',2);

INSERT INTO public.catalog_posts (title, slug, excerpt, body, status, published_at) VALUES
  ('Welcome to The Table','welcome-to-the-table','Why we built a shared table for indie books, and how to get a seat at it.','The Table is where books finished in the Author''s Workshop go to meet readers. Every month we set out a new issue: a handful of indie titles chosen by our editors, with the people who made them credited by name.

Submissions are open to any author with a finished book. Bring your cover, your hook, and the places readers can buy it.','published', now()),
  ('How an issue comes together','how-an-issue-comes-together','A look behind the curtain at curation, quotas and spotlight picks.','Each issue starts with a set of category quotas. Editors read submissions, fill each category, and choose one spotlight title to lead the issue.','published', now() - interval '10 days');

INSERT INTO public.catalog_site_content (key, value) VALUES
  ('table.hero.title','A table set for indie books'),
  ('table.hero.subtitle','Every month we lay out a new issue of independent titles — read the flyer, meet the authors, buy the book.'),
  ('table.submit.intro','Submissions are free. Tell us about your finished book and where readers can buy it.'),
  ('journal.hero.title','The Journal'),
  ('journal.hero.subtitle','Notes on publishing, craft and the books on our table.');