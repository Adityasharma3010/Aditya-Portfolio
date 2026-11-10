-- Guestbook table. Run this once in Supabase: SQL Editor > New query > paste > Run.
-- Visitors never talk to Supabase directly: api/guestbook.js uses the service role key on the server,
-- so row level security stays ON with NO policies (nobody can read or write from the browser).
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 60),
  message     text not null check (char_length(message) between 3 and 280),
  approved    boolean not null default false
);

create index if not exists guestbook_approved_created_idx on public.guestbook (approved, created_at desc);

alter table public.guestbook enable row level security;

-- Approving a message: Supabase dashboard > Table Editor > guestbook > tick "approved" on the row.
-- Removing one later: untick it (or delete the row).
