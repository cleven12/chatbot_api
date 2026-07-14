-- Tourism RAG API — initial schema
-- Run in Supabase SQL editor (or via supabase db push)

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- tenants: one row per tourism company
-- ---------------------------------------------------------------------------
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_key text not null unique,
  system_prompt text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tenants_api_key_idx on tenants (api_key);

-- ---------------------------------------------------------------------------
-- documents: knowledge-base chunks + embeddings (768-dim Gemini embedding-001)
-- ---------------------------------------------------------------------------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768)
);

create index if not exists documents_tenant_id_idx on documents (tenant_id);

-- IVFFlat cosine index for similarity search (lists=100 is a reasonable default)
create index if not exists documents_embedding_idx
  on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ---------------------------------------------------------------------------
-- chat_history: per-session messages scoped to a tenant
-- ---------------------------------------------------------------------------
create table if not exists chat_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  session_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_history_tenant_session_idx
  on chat_history (tenant_id, session_id, created_at);

-- ---------------------------------------------------------------------------
-- rate_limits: simple fixed-window counters per tenant (Phase 7)
-- ---------------------------------------------------------------------------
create table if not exists rate_limits (
  tenant_id uuid not null references tenants (id) on delete cascade,
  window_start timestamptz not null,
  request_count int not null default 0,
  primary key (tenant_id, window_start)
);

-- ---------------------------------------------------------------------------
-- match_documents: tenant-scoped cosine similarity search
-- ---------------------------------------------------------------------------
create or replace function match_documents(
  query_embedding vector(768),
  match_tenant uuid,
  match_count int default 4
)
returns table (
  id uuid,
  tenant_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    d.id,
    d.tenant_id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.tenant_id = match_tenant
    and d.embedding is not null
  order by d.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
