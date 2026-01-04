-- Enable Storage
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up security policies for Avatars
-- 1. Everyone can view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Authenticated users can upload an avatar
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 3. Users can update their own avatar (based on file name convention or just generally authenticated for now as simplistic RBAC)
-- Ideally we restrict path to user ID, but for MVP:
create policy "Authenticated users can update avatars."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
