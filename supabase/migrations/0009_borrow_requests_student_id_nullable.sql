-- 0007 added the new borrower_name/borrower_student_id columns but the old
-- student_id column is still "not null", so the new app code (which no
-- longer sets student_id at all) can't insert until this runs. Safe/
-- additive: only relaxes a constraint, doesn't touch data. The column
-- itself is dropped later in 0010, once the new code is confirmed working.

alter table borrow_requests alter column student_id drop not null;
