-- [Person 3 - Backend]
create table demo_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  business_name text,
  business_type text,
  extracted_data jsonb,
  created_at timestamptz default now()
);
create index demo_leads_email_idx on demo_leads (email);
