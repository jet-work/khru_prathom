-- Students no longer authenticate at all, so the equipment catalog and
-- loan-photo uploads need to work for the anon role. borrow_requests stays
-- closed to anon on purpose (see 0009 comment / app code) — all student
-- writes to that table go through API routes using the service-role key
-- instead, so a raw anon REST call against borrow_requests still returns
-- nothing even after this migration.

create policy "equipment_select_anon"
  on equipment for select
  to anon
  using (true);

create policy "loan_photos_anon_write"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'loan-photos');

create policy "loan_photos_anon_update"
  on storage.objects for update
  to anon
  using (bucket_id = 'loan-photos');
