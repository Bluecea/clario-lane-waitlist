create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;

create policy "Enable insert for anon"
  on waitlist for insert
  to anon
  with check (true);

create policy "Enable all for service_role"
  on waitlist for all
  to service_role
  using (true)
  with check (true);

create policy "Enable read for service_role"
    on waitlist for select
    to service_role
    using (true);
