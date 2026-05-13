-- ============================================================
-- AI Accounting Assistant — Initial Schema
-- Saudi Arabian Restaurant & Cafe Market
-- Migration: 0001_init.sql
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fuzzy text matching

-- ============================================================
-- ORGANIZATIONS (each restaurant or accounting office is a tenant)
-- ============================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  type text not null check (type in ('restaurant','cafe','accounting_office')),
  vat_number text,
  cr_number text,           -- Saudi commercial registration number
  country text default 'SA',
  currency text default 'SAR',
  timezone text default 'Asia/Riyadh',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PROFILES (linked to Supabase auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  org_id uuid references organizations on delete cascade,
  full_name text,
  email text,
  phone text,
  role text check (role in ('owner','accountant','manager','staff')),
  language text default 'ar',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index profiles_org_idx on profiles (org_id);

-- ============================================================
-- VENDORS (suppliers — the AI learns these over time)
-- ============================================================
create table vendors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  name text not null,
  name_ar text,
  vat_number text,
  default_category text,
  contact_phone text,
  notes text,
  created_at timestamptz default now(),
  unique (org_id, name)
);
create index vendors_org_idx on vendors (org_id);
create index vendors_name_trgm on vendors using gin (name gin_trgm_ops);

-- ============================================================
-- INVOICES (the heart of the system)
-- ============================================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  vendor_id uuid references vendors,
  invoice_number text,
  invoice_date date,
  total numeric(14,2),
  vat_amount numeric(14,2),
  subtotal numeric(14,2),
  currency text default 'SAR',
  payment_method text check (payment_method in ('cash','card','bank_transfer','credit')),
  category text,            -- food_cost / utilities / supplies / maintenance / salaries / rent / misc
  status text default 'pending' check (status in ('pending','review','approved','rejected')),
  source text check (source in ('upload','whatsapp','email','manual')),
  file_url text,            -- Supabase Storage path
  raw_extraction jsonb,     -- raw AI output for audit
  confidence numeric(3,2),  -- AI confidence 0.00–1.00
  language text,            -- 'ar' / 'en' / 'mixed'
  notes text,
  uploaded_by uuid references profiles,
  approved_by uuid references profiles,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index invoices_org_date_idx on invoices (org_id, invoice_date desc);
create index invoices_org_status_idx on invoices (org_id, status);
create index invoices_vendor_idx on invoices (vendor_id);

-- ============================================================
-- POS SALES (imported daily from POS system: Foodics, Marn, etc.)
-- ============================================================
create table pos_sales (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  sale_date date not null,
  shift text,
  total numeric(14,2),
  cash_amount numeric(14,2),
  card_amount numeric(14,2),
  vat_amount numeric(14,2),
  transactions_count int,
  pos_system text,          -- 'foodics' / 'marn' / 'manual' / etc.
  raw_data jsonb,
  created_at timestamptz default now()
);
create index pos_sales_org_date_idx on pos_sales (org_id, sale_date);

-- ============================================================
-- BANK TRANSACTIONS (imported from bank statement)
-- ============================================================
create table bank_transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  txn_date date not null,
  description text,
  amount numeric(14,2),     -- positive = credit (money in), negative = debit (money out)
  reference text,
  bank_name text,
  account_number text,
  raw_row jsonb,
  matched boolean default false,
  matched_to_id uuid,       -- references invoices.id or pos_sales.id
  matched_to_type text,     -- 'invoice' / 'pos_sale'
  created_at timestamptz default now()
);
create index bank_txn_org_date_idx on bank_transactions (org_id, txn_date);
create index bank_txn_unmatched_idx on bank_transactions (org_id, matched) where matched = false;

-- ============================================================
-- CASH ENTRIES (per shift — the cash tracking system)
-- ============================================================
create table cash_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  entry_date date not null,
  shift text,
  expected_cash numeric(14,2),  -- from POS report
  actual_cash numeric(14,2),    -- counted by employee
  difference numeric(14,2) generated always as (actual_cash - expected_cash) stored,
  employee_id uuid references profiles,
  notes text,
  flagged boolean default false,  -- AI flags suspicious patterns
  created_at timestamptz default now()
);
create index cash_entries_org_date_idx on cash_entries (org_id, entry_date);

-- ============================================================
-- RECONCILIATION RUNS (one row per "Close Day" or manual reconcile)
-- ============================================================
create table reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  run_date date default current_date,
  period_start date,
  period_end date,
  status text default 'running' check (status in ('running','complete','failed')),
  triggered_by uuid references profiles,
  summary jsonb,            -- { matched: 142, unmatched: 8, total_diff: 1240.50, issues_count: 5 }
  error_message text,
  started_at timestamptz default now(),
  completed_at timestamptz
);
create index recon_runs_org_idx on reconciliation_runs (org_id, run_date desc);

-- ============================================================
-- RECONCILIATION ISSUES (the actionable output for accountants)
-- ============================================================
create table reconciliation_issues (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references reconciliation_runs on delete cascade,
  org_id uuid references organizations on delete cascade,
  issue_type text check (issue_type in (
    'missing_invoice','missing_pos','duplicate','cash_short',
    'cash_over','bank_fee','timing_diff','pos_mismatch','refund','vat_mismatch'
  )),
  severity text check (severity in ('low','medium','high')),
  amount numeric(14,2),
  description text,
  description_ar text,
  suggested_fix text,
  suggested_fix_ar text,
  related_invoice_id uuid references invoices,
  related_bank_txn_id uuid references bank_transactions,
  related_pos_sale_id uuid references pos_sales,
  related_cash_entry_id uuid references cash_entries,
  status text default 'open' check (status in ('open','resolved','dismissed','snoozed')),
  resolved_by uuid references profiles,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz default now()
);
create index recon_issues_org_status_idx on reconciliation_issues (org_id, status);
create index recon_issues_run_idx on reconciliation_issues (run_id);

-- ============================================================
-- AI CORRECTIONS (training data — the AI learns from these)
-- ============================================================
create table ai_corrections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  entity_type text,         -- 'invoice' / 'category' / 'vendor'
  entity_id uuid,
  field text,
  ai_value text,
  corrected_value text,
  corrected_by uuid references profiles,
  created_at timestamptz default now()
);
create index ai_corrections_org_idx on ai_corrections (org_id, created_at desc);

-- ============================================================
-- AUDIT LOG (ZATCA compliance — all critical changes tracked)
-- ============================================================
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete cascade,
  user_id uuid references profiles,
  action text not null,     -- 'create' / 'update' / 'delete' / 'approve'
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
create index audit_log_org_idx on audit_log (org_id, created_at desc);
create index audit_log_entity_idx on audit_log (entity_type, entity_id);

-- ============================================================
-- UPDATED_AT TRIGGER (auto-update timestamp on changes)
-- ============================================================
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at before update on organizations
  for each row execute function set_updated_at();
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger invoices_updated_at before update on invoices
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (CRITICAL for multi-tenant isolation)
-- ============================================================
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table vendors enable row level security;
alter table invoices enable row level security;
alter table pos_sales enable row level security;
alter table bank_transactions enable row level security;
alter table cash_entries enable row level security;
alter table reconciliation_runs enable row level security;
alter table reconciliation_issues enable row level security;
alter table ai_corrections enable row level security;
alter table audit_log enable row level security;

-- Helper: returns current authenticated user's org_id
create or replace function auth_org_id() returns uuid
language sql stable security definer
set search_path = public
as $$
  select org_id from profiles where id = auth.uid()
$$;

-- ============================================================
-- RLS POLICIES (one per table — strict org isolation)
-- ============================================================

-- Organizations: users can only see their own org
create policy "org_self_select" on organizations
  for select using (id = auth_org_id());
create policy "org_self_update" on organizations
  for update using (id = auth_org_id()) with check (id = auth_org_id());

-- Profiles: users see profiles in their org only
create policy "profile_org_select" on profiles
  for select using (org_id = auth_org_id());
create policy "profile_self_update" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Generic org-isolation policy for all tenant tables
create policy "vendors_org_all" on vendors
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "invoices_org_all" on invoices
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "pos_sales_org_all" on pos_sales
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "bank_txn_org_all" on bank_transactions
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "cash_entries_org_all" on cash_entries
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "recon_runs_org_all" on reconciliation_runs
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "recon_issues_org_all" on reconciliation_issues
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "ai_corrections_org_all" on ai_corrections
  for all using (org_id = auth_org_id()) with check (org_id = auth_org_id());
create policy "audit_log_org_select" on audit_log
  for select using (org_id = auth_org_id());

-- ============================================================
-- DONE — Schema ready for first migration
-- ============================================================
