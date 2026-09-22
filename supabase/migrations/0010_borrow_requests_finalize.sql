-- Run this ONLY after the app code that writes borrower_name/borrower_student_id
-- (instead of student_id) is deployed and confirmed working in production.
-- Take a Supabase backup/snapshot before running this — it drops a column.

alter table borrow_requests
  alter column borrower_name set not null,
  alter column borrower_student_id set not null;

-- Dead code once students are anon: every write now comes from either the
-- service-role client (bypasses this trigger via the auth.role() check) or
-- an admin session (bypasses via is_admin()) — its restrictive branch can
-- no longer be reached by anyone.
drop trigger if exists borrow_requests_guard_update on borrow_requests;
drop function if exists guard_borrow_request_update();

drop policy if exists "borrow_requests_update_own_checkin" on borrow_requests;
drop policy if exists "borrow_requests_select_own_or_admin" on borrow_requests;
drop policy if exists "borrow_requests_insert_own" on borrow_requests;
-- "borrow_requests_update_admin" (0002) stays — that's the admin is_admin() backstop.
-- No anon-facing select/insert/update policy is ever added for this table.

alter table borrow_requests drop column student_id;
