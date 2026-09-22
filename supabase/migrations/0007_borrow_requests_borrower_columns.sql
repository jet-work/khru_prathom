-- Add plain-text borrower identity columns to borrow_requests so students no
-- longer need an auth.users/profiles row to submit a request. Additive only
-- (existing student_id column and its policies stay put until 0009, once
-- the new app code is live and confirmed working).

alter table borrow_requests
  add column borrower_name text,
  add column borrower_student_id text;

-- Backfill existing rows from the profile they were created under.
update borrow_requests br
set borrower_name = p.full_name,
    borrower_student_id = p.student_id
from profiles p
where p.id = br.student_id;

-- Safety net for any row with no matching profile (shouldn't happen, but
-- don't let it block the NOT NULL step in 0009).
update borrow_requests
set borrower_name = coalesce(borrower_name, 'ไม่ทราบชื่อ (ข้อมูลเก่า)'),
    borrower_student_id = coalesce(borrower_student_id, 'UNKNOWN')
where borrower_name is null or borrower_student_id is null;

create index idx_borrow_requests_borrower_student_id on borrow_requests(borrower_student_id);
