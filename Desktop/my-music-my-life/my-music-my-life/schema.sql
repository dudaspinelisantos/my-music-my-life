-- My Music My Life — esquema opcional para Supabase
-- Execute no SQL Editor do seu projeto Supabase.
-- Nunca coloque a chave service_role no navegador.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Music lover',
  avatar text not null default '♡',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  description text not null default '',
  cover_color text not null default 'cover-1',
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id text primary key,
  title text not null,
  artist text not null,
  album text not null default '',
  genre text not null default '',
  audio_url text,
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id text not null references public.tracks(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create table if not exists public.favorite_tracks (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.saved_artists (
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, artist_name)
);

create table if not exists public.saved_albums (
  user_id uuid not null references auth.users(id) on delete cascade,
  album_name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, album_name)
);

create table if not exists public.play_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id) on delete cascade,
  played_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.tracks enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.favorite_tracks enable row level security;
alter table public.saved_artists enable row level security;
alter table public.saved_albums enable row level security;
alter table public.play_history enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "playlists own all" on public.playlists;
create policy "playlists own all" on public.playlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tracks readable by authenticated" on public.tracks;
create policy "tracks readable by authenticated" on public.tracks for select to authenticated using (true);

drop policy if exists "playlist tracks through own playlist" on public.playlist_tracks;
create policy "playlist tracks through own playlist" on public.playlist_tracks for all
using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

drop policy if exists "favorite tracks own all" on public.favorite_tracks;
create policy "favorite tracks own all" on public.favorite_tracks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved artists own all" on public.saved_artists;
create policy "saved artists own all" on public.saved_artists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved albums own all" on public.saved_albums;
create policy "saved albums own all" on public.saved_albums for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "play history own all" on public.play_history;
create policy "play history own all" on public.play_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Criação automática de perfil após cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Music lover'),
          coalesce(new.raw_user_meta_data ->> 'avatar', '♡'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
