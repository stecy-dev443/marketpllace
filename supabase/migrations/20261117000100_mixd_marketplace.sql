-- MIXD Marketplace: profile and listing foundations.
-- Run this migration in the Supabase SQL editor or with the Supabase CLI.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'both')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  category text not null,
  listing_type text not null check (listing_type in ('physical', 'digital', 'service', 'website')),
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD',
  image_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_active_created_idx
  on public.listings (status, created_at desc);
create index if not exists listings_seller_idx
  on public.listings (seller_id);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Active listings are public"
  on public.listings for select
  to anon, authenticated
  using (status = 'active' or (select auth.uid()) = seller_id);

create policy "Sellers can create their own listings"
  on public.listings for insert
  to authenticated
  with check ((select auth.uid()) = seller_id);

create policy "Sellers can update their own listings"
  on public.listings for update
  to authenticated
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);

create policy "Sellers can delete their own listings"
  on public.listings for delete
  to authenticated
  using ((select auth.uid()) = seller_id);

-- Keep updated_at current on edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

-- Create a profile on signup. Role is a profile preference only, never an
-- authorization claim; row ownership is enforced with auth.uid() above.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    case
      when new.raw_user_meta_data ->> 'requested_role' in ('buyer', 'seller', 'both')
      then new.raw_user_meta_data ->> 'requested_role'
      else 'buyer'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_mixd on auth.users;
create trigger on_auth_user_created_mixd
after insert on auth.users
for each row execute function public.handle_new_user();
