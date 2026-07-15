-- Fix: "new row violates row-level security policy"
--
-- This API uses the Supabase *service_role* key server-side only.
-- service_role normally bypasses RLS. If you still hit RLS errors you are
-- almost certainly using the *anon* key in SUPABASE_SERVICE_KEY.
--
-- This migration:
-- 1) Grants full access to service_role
-- 2) Enables RLS with no public policies (anon/authenticated blocked)
-- 3) Adds explicit service_role policies as a safety net

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter table if exists tenants enable row level security;
alter table if exists documents enable row level security;
alter table if exists chat_history enable row level security;
alter table if exists rate_limits enable row level security;

-- Drop old policies if re-run
drop policy if exists "service_role_tenants" on tenants;
drop policy if exists "service_role_documents" on documents;
drop policy if exists "service_role_chat_history" on chat_history;
drop policy if exists "service_role_rate_limits" on rate_limits;

create policy "service_role_tenants"
  on tenants for all to service_role
  using (true) with check (true);

create policy "service_role_documents"
  on documents for all to service_role
  using (true) with check (true);

create policy "service_role_chat_history"
  on chat_history for all to service_role
  using (true) with check (true);

create policy "service_role_rate_limits"
  on rate_limits for all to service_role
  using (true) with check (true);

-- OPTIONAL emergency bypass (uncomment ONLY if you must use a non-service key locally):
-- alter table tenants disable row level security;
-- alter table documents disable row level security;
-- alter table chat_history disable row level security;
-- alter table rate_limits disable row level security;
