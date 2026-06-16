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

create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_profiles_company_id on profiles(company_id);
create index if not exists idx_movements_company_id on movements(company_id);
create index if not exists idx_reports_company_id on reports(company_id);
create index if not exists idx_sunat_queries_company_id on sunat_queries(company_id);
create index if not exists idx_auth_attempts_action_subject_created_at
on auth_attempts(action, subject, created_at desc);
