-- Create tags table
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamp with time zone default now() not null,
  unique(user_id, name)
);

-- Establish RLS for tags
alter table public.tags enable row level security;

create policy "Users can view their own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can create their own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tags"
  on public.tags for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tags"
  on public.tags for delete
  using (auth.uid() = user_id);


-- Create note_tags junction table
create table if not exists public.note_tags (
  note_id uuid references public.notes(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (note_id, tag_id)
);

-- Establish RLS for note_tags
alter table public.note_tags enable row level security;

create policy "Users can view tags on their notes"
  on public.note_tags for select
  using (
    exists (
      select 1 from public.notes
      where id = note_tags.note_id
      and user_id = auth.uid()
    )
  );

create policy "Users can add tags to their notes"
  on public.note_tags for insert
  with check (
    exists (
      select 1 from public.notes
      where id = note_tags.note_id
      and user_id = auth.uid()
    )
  );

create policy "Users can remove tags from their notes"
  on public.note_tags for delete
  using (
    exists (
      select 1 from public.notes
      where id = note_tags.note_id
      and user_id = auth.uid()
    )
  );
;
