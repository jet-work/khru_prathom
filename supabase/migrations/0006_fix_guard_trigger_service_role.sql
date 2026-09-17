-- 0005's guard trigger blocked service_role writes too, since is_admin()
-- relies on auth.uid() which is null for the service role (no end-user JWT).
-- service_role already bypasses RLS by design, so it should bypass this
-- application-level guard as well.

create or replace function guard_borrow_request_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.role() = 'service_role' or is_admin() then
    return new;
  end if;

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
