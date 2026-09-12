-- Equipment loan tracking system: core schema

create type user_role as enum ('admin', 'student');
create type borrow_status as enum ('pending', 'approved', 'returned', 'rejected');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  student_id text not null unique,
  year smallint not null check (year between 1 and 4),
  role user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  total_quantity integer not null check (total_quantity >= 0),
  photo_url text,
  category text,
  room text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table borrow_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  equipment_id uuid not null references equipment(id) on delete restrict,
  requested_quantity integer not null check (requested_quantity > 0),
  borrow_date date not null,
  return_date date not null,
  status borrow_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  actual_return_date timestamptz,
  checkout_photo_url text,
  checkout_condition_note text,
  checkin_photo_url text,
  checkin_condition_note text,
  created_at timestamptz not null default now(),
  check (return_date >= borrow_date)
);

create index idx_borrow_requests_equipment on borrow_requests(equipment_id);
create index idx_borrow_requests_student on borrow_requests(student_id);
create index idx_borrow_requests_status on borrow_requests(status);

-- Live availability, derived from approved requests instead of a mutable counter
create view equipment_with_availability as
select
  e.*,
  coalesce(sum(br.requested_quantity) filter (where br.status = 'approved'), 0)::integer as currently_borrowed,
  (e.total_quantity - coalesce(sum(br.requested_quantity) filter (where br.status = 'approved'), 0))::integer as available_quantity
from equipment e
left join borrow_requests br on br.equipment_id = e.id
group by e.id;

-- Auto-create a profile row when a new auth user signs up, reading fields
-- passed via supabase.auth.signUp({ options: { data: {...} } })
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, student_id, year, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'student_id', ''),
    coalesce((new.raw_user_meta_data->>'year')::smallint, 1),
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger equipment_set_updated_at
  before update on equipment
  for each row execute function set_updated_at();
