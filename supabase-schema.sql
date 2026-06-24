-- Supabase schema for InnovSystem Transporte
-- Ejecuta este script en el SQL editor de Supabase para crear las tablas necesarias.

create extension if not exists "pgcrypto";

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  ruc text not null unique,
  business_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_companies_email_unique
on companies (lower(email));

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  full_name text not null,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  constraint profiles_user_unique unique (user_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table profiles
      add constraint profiles_role_check
      check (role in ('admin', 'user'));
  end if;
end
$$;

create table if not exists movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  movement_type text not null,
  document_type text not null,
  description text not null,
  amount numeric not null,
  movement_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  report_type text not null,
  file_url text not null,
  generated_at timestamptz not null default now()
);

create table if not exists sunat_queries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  ruc text not null,
  response jsonb not null,
  queried_at timestamptz not null default now()
);

create table if not exists sunat_sire_configs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references companies(id) on delete cascade,
  ruc text not null,
  sol_user text not null,
  sol_password_encrypted text not null,
  client_id text not null,
  client_secret_encrypted text not null,
  security_base_url text not null default 'https://api-seguridad.sunat.gob.pe',
  api_base_url text not null default 'https://api-sire.sunat.gob.pe',
  last_tested_at timestamptz,
  last_test_status text,
  last_test_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sunat_sire_sales_tickets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  periodo text not null,
  ticket_number text not null,
  file_type_code text not null,
  process_status text,
  report_file_name text,
  report_file_type_code text,
  last_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sunat_sire_sales_tickets_unique unique (company_id, ticket_number)
);

create table if not exists auth_attempts (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  subject text not null,
  created_at timestamptz not null default now()
);

alter table companies enable row level security;
alter table profiles enable row level security;
alter table movements enable row level security;
alter table reports enable row level security;
alter table sunat_queries enable row level security;
alter table sunat_sire_configs enable row level security;
alter table sunat_sire_sales_tickets enable row level security;
alter table auth_attempts enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
on profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "companies_select_own" on companies;
create policy "companies_select_own"
on companies
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.company_id = companies.id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "movements_select_own_company" on movements;
create policy "movements_select_own_company"
on movements
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.company_id = movements.company_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "reports_select_own_company" on reports;
create policy "reports_select_own_company"
on reports
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.company_id = reports.company_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "sunat_queries_select_own_company" on sunat_queries;
create policy "sunat_queries_select_own_company"
on sunat_queries
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.company_id = sunat_queries.company_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "sunat_sire_configs_select_own_company" on sunat_sire_configs;
create policy "sunat_sire_configs_select_own_company"
on sunat_sire_configs
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.company_id = sunat_sire_configs.company_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "sunat_sire_sales_tickets_select_own_company" on sunat_sire_sales_tickets;
create policy "sunat_sire_sales_tickets_select_own_company"
on sunat_sire_sales_tickets
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.company_id = sunat_sire_sales_tickets.company_id
      and profiles.user_id = auth.uid()
  )
);

create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_profiles_company_id on profiles(company_id);
create index if not exists idx_movements_company_id on movements(company_id);
create index if not exists idx_reports_company_id on reports(company_id);
create index if not exists idx_sunat_queries_company_id on sunat_queries(company_id);
create index if not exists idx_sunat_sire_configs_company_id on sunat_sire_configs(company_id);
create index if not exists idx_sunat_sire_sales_tickets_company_id on sunat_sire_sales_tickets(company_id);
create index if not exists idx_sunat_sire_sales_tickets_periodo on sunat_sire_sales_tickets(periodo);
create index if not exists idx_auth_attempts_action_subject_created_at
on auth_attempts(action, subject, created_at desc);

-- Backfill de roles:
-- Garantiza que cada empresa tenga al menos un administrador.
-- Regla: si una empresa no tiene admins, se promueve el perfil mas antiguo.
with ranked_profiles as (
  select
    p.id,
    p.company_id,
    p.role,
    row_number() over (
      partition by p.company_id
      order by p.created_at asc, p.id asc
    ) as profile_rank,
    bool_or(p.role = 'admin') over (
      partition by p.company_id
    ) as company_has_admin
  from profiles p
)
update profiles p
set role = 'admin'
from ranked_profiles rp
where p.id = rp.id
  and rp.profile_rank = 1
  and rp.company_has_admin = false;
