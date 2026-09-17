-- Allow a student to update their own approved borrow_request to attach a
-- checkin (return) photo/note, without being able to touch any other field
-- (status transitions stay admin-only, enforced below via trigger since RLS
-- alone can't restrict individual columns for a shared "authenticated" role).

create policy "borrow_requests_update_own_checkin"
  on borrow_requests for update
  using (student_id = auth.uid() and status = 'approved')
  with check (student_id = auth.uid() and status = 'approved');

create function guard_borrow_request_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if is_admin() then
    return new;
  end if;

  -- Non-admins (the owning student) may only ever set checkin fields on an
  -- approved request; every other column must stay unchanged.
  if new.student_id is distinct from old.student_id
    or new.equipment_id is distinct from old.equipment_id
    or new.requested_quantity is distinct from old.requested_quantity
    or new.borrow_date is distinct from old.borrow_date
    or new.return_date is distinct from old.return_date
    or new.status is distinct from old.status
    or new.reviewed_by is distinct from old.reviewed_by
    or new.reviewed_at is distinct from old.reviewed_at
    or new.actual_return_date is distinct from old.actual_return_date
    or new.checkout_photo_url is distinct from old.checkout_photo_url
    or new.checkout_condition_note is distinct from old.checkout_condition_note
  then
    raise exception 'Students may only update checkin_photo_url and checkin_condition_note';
  end if;

  return new;
end;
$$;

create trigger borrow_requests_guard_update
  before update on borrow_requests
  for each row execute function guard_borrow_request_update();
