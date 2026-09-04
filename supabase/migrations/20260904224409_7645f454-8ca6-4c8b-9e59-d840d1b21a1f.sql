-- books
create table public.books (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  subtitle text,
  pen_name text,
  genre text,
  publishing_path text,
  audience text,
  comparables text,
  goals text,
  length_estimate text,
  target_publication_date date,
  start_date date default current_date,
  budget numeric,
  isbn text,
  imprint text,
  trim_size text,
  price text,
  language text default 'English',
  series text,
  edition text,
  cover_url text,
  status text not null default 'active',
  template_id uuid,
  metadata jsonb not null default '{}',
  attachments jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.books to authenticated;
grant all on public.books to service_role;
alter table public.books enable row level security;
create policy "Authors manage their own books" on public.books for all to authenticated
  using (author_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (author_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create trigger update_books_updated_at before update on public.books for each row execute function public.update_updated_at_column();

-- collaborators (needed by the books collaborator policy and helpers)
create table public.collaborators (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text,
  role text not null,
  status text not null default 'invited',
  invited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (book_id, email)
);
grant select, insert, update, delete on public.collaborators to authenticated;
grant all on public.collaborators to service_role;
alter table public.collaborators enable row level security;

-- helpers
create or replace function public.is_book_author(_book_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.books where id = _book_id and author_id = auth.uid())
$$;
revoke execute on function public.is_book_author(uuid) from public, anon;

create or replace function public.is_book_member(_book_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_book_author(_book_id)
    or exists (select 1 from public.collaborators where book_id = _book_id and user_id = auth.uid() and status = 'active')
$$;
revoke execute on function public.is_book_member(uuid) from public, anon;

create policy "Collaborators can view books they belong to" on public.books for select to authenticated
  using (exists (select 1 from public.collaborators c where c.book_id = id and c.user_id = auth.uid() and c.status = 'active'));

create policy "Authors manage collaborators" on public.collaborators for all to authenticated
  using (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'));
create policy "Collaborators can view their own membership" on public.collaborators for select to authenticated
  using (user_id = auth.uid() or email = (select email from auth.users where id = auth.uid()));

-- phases
create table public.phases (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade not null,
  key text not null,
  name text not null,
  type text not null default 'sprint',
  position int not null default 0,
  status text not null default 'not-started',
  suggested_start date,
  suggested_end date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.phases to authenticated;
grant all on public.phases to service_role;
alter table public.phases enable row level security;
create policy "Book members can view phases" on public.phases for select to authenticated
  using (public.is_book_member(book_id) or public.has_role(auth.uid(), 'admin'));
create policy "Authors manage phases" on public.phases for all to authenticated
  using (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'));

-- milestones (each has exactly one requirement, stored inline)
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references public.phases(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,
  name text not null,
  description text,
  owner text default 'Author',
  owner_user_id uuid references auth.users(id) on delete set null,
  requirement_type text,
  requirement_details jsonb not null default '{}',
  instructions text,
  resources jsonb not null default '[]',
  status text not null default 'not-started',
  due_date date,
  approval_required boolean not null default false,
  position int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.milestones to authenticated;
grant all on public.milestones to service_role;
alter table public.milestones enable row level security;
create policy "Authors and assigned collaborators can view milestones" on public.milestones for select to authenticated
  using (public.is_book_author(book_id) or owner_user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Authors manage milestones" on public.milestones for all to authenticated
  using (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'));
create policy "Assigned collaborators can update their milestones" on public.milestones for update to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create trigger update_milestones_updated_at before update on public.milestones for each row execute function public.update_updated_at_column();

-- notes
create table public.milestone_notes (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid references public.milestones(id) on delete cascade not null,
  author_user_id uuid references auth.users(id) on delete cascade not null,
  body text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.milestone_notes to authenticated;
grant all on public.milestone_notes to service_role;
alter table public.milestone_notes enable row level security;
create policy "Book members can view notes" on public.milestone_notes for select to authenticated
  using (exists (select 1 from public.milestones m where m.id = milestone_id and (public.is_book_author(m.book_id) or m.owner_user_id = auth.uid())) or public.has_role(auth.uid(), 'admin'));
create policy "Book members can add notes" on public.milestone_notes for insert to authenticated
  with check (author_user_id = auth.uid() and exists (select 1 from public.milestones m where m.id = milestone_id and (public.is_book_author(m.book_id) or m.owner_user_id = auth.uid())));
create policy "Note authors can edit their notes" on public.milestone_notes for update to authenticated
  using (author_user_id = auth.uid()) with check (author_user_id = auth.uid());
create policy "Note authors and book authors can delete notes" on public.milestone_notes for delete to authenticated
  using (author_user_id = auth.uid() or exists (select 1 from public.milestones m where m.id = milestone_id and public.is_book_author(m.book_id)) or public.has_role(auth.uid(), 'admin'));

-- activity
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_name text,
  text text not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.activity to authenticated;
grant all on public.activity to service_role;
alter table public.activity enable row level security;
create policy "Book members can view activity" on public.activity for select to authenticated
  using (public.is_book_member(book_id) or public.has_role(auth.uid(), 'admin'));
create policy "Book members can add activity" on public.activity for insert to authenticated
  with check (public.is_book_member(book_id));
create policy "Admins can delete activity" on public.activity for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- reflections
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade not null unique,
  achieved_goals boolean,
  goals_notes text,
  published_on_time boolean,
  next_steps text,
  custom jsonb not null default '[]',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reflections to authenticated;
grant all on public.reflections to service_role;
alter table public.reflections enable row level security;
create policy "Authors manage their reflections" on public.reflections for all to authenticated
  using (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_book_author(book_id) or public.has_role(auth.uid(), 'admin'));
create trigger update_reflections_updated_at before update on public.reflections for each row execute function public.update_updated_at_column();

-- templates
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  genre text,
  audience text,
  duration text,
  phases jsonb not null default '[]',
  published boolean not null default false,
  archived boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.templates to authenticated;
grant all on public.templates to service_role;
alter table public.templates enable row level security;
create policy "Signed-in users can view published templates" on public.templates for select to authenticated
  using ((published and not archived) or owner_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Authors manage their own templates" on public.templates for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Admins manage all templates" on public.templates for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger update_templates_updated_at before update on public.templates for each row execute function public.update_updated_at_column();

-- coach conversations
create table public.coach_conversations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.coach_conversations to authenticated;
grant all on public.coach_conversations to service_role;
alter table public.coach_conversations enable row level security;
create policy "Users manage their own coach chats" on public.coach_conversations for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger update_coach_conversations_updated_at before update on public.coach_conversations for each row execute function public.update_updated_at_column();