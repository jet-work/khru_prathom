-- Storage bucket for equipment photos and checkout/checkin evidence photos.
-- Public read (these are just condition photos, not sensitive), write requires auth.

insert into storage.buckets (id, name, public)
values ('loan-photos', 'loan-photos', true)
on conflict (id) do nothing;

create policy "loan_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'loan-photos');

create policy "loan_photos_authenticated_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'loan-photos');

create policy "loan_photos_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'loan-photos');
