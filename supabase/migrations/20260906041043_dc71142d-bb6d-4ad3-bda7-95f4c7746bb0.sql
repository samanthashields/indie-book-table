ALTER TABLE public.books ADD COLUMN IF NOT EXISTS has_cycle boolean NOT NULL DEFAULT false;

UPDATE public.books b SET has_cycle = true
WHERE EXISTS (SELECT 1 FROM public.phases p WHERE p.book_id = b.id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', ''));
  insert into public.user_roles (user_id, role)
  values (new.id, 'author'::app_role)
  on conflict (user_id, role) do nothing;
  return new;
end;
$function$;

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT ur.user_id, 'author'::app_role
FROM public.user_roles ur
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles a WHERE a.user_id = ur.user_id AND a.role = 'author'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;