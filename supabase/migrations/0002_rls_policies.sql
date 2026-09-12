-- Row Level Security

alter table profiles enable row level security;
alter table equipment enable row level security;
alter table borrow_requests enable row level security;

-- security definer helper avoids recursive RLS lookups against profiles itself
create function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or is_admin());

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- equipment: everyone authenticated can read, only admins can write
create policy "equipment_select_authenticated"
  on equipment for select
  to authenticated
  using (true);

create policy "equipment_insert_admin"
  on equipment for insert
  with check (is_admin());

create policy "equipment_update_admin"
  on equipment for update
  using (is_admin())
  with check (is_admin());

create policy "equipment_delete_admin"
  on equipment for delete
  using (is_admin());

-- borrow_requests
create policy "borrow_requests_select_own_or_admin"
  on borrow_requests for select
  using (student_id = auth.uid() or is_admin());

create policy "borrow_requests_insert_own"
  on borrow_requests for insert
  with check (student_id = auth.uid());

-- Only admins transition status (approve/reject/return); students cannot
-- edit their own request after submitting it.
create policy "borrow_requests_update_admin"
  on borrow_requests for update
  using (is_admin())
  with check (is_admin());
