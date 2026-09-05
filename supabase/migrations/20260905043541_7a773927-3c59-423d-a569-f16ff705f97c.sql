insert into public.profiles (user_id, display_name, plan)
select u.id, coalesce(u.raw_user_meta_data->>'display_name', u.email), case when u.email = 'collab@bookcycles.test' then 'free' else 'paid' end
from auth.users u
where u.email in ('admin@bookcycles.test','author@bookcycles.test','collab@bookcycles.test')
on conflict (user_id) do update set plan = excluded.plan, display_name = coalesce(public.profiles.display_name, excluded.display_name);

insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role from auth.users u
where u.email in ('admin@bookcycles.test','samantha.jo.shields@gmail.com')
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'author'::public.app_role from auth.users u
where u.email in ('admin@bookcycles.test','author@bookcycles.test')
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'collaborator'::public.app_role from auth.users u
where u.email = 'collab@bookcycles.test'
on conflict (user_id, role) do nothing;