# Tourism RAG API

Multi-tenant, API-only RAG chatbot backend for East African tourism companies (safari/trek operators). One shared Netlify deployment; each tenant has its own API key, system prompt, and knowledge-base namespace in Supabase Postgres + pgvector.

| | |
|---|---|
| Runtime | Netlify Functions (TypeScript `.mts`) |
| Database | Supabase Postgres + `pgvector` |
| Embeddings | Google Gemini `embedding-001` (768-dim) |
| LLM | Groq Llama 3.1 70B (primary), Gemini (fallback) |
| Auth | `x-api-key` (tenants) · `x-admin-key` (admin) |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase **service role** key (server only) |
| `GEMINI_API_KEY` | Google AI Studio / Gemini API key |
| `GROQ_API_KEY` | Groq API key |
| `ADMIN_API_KEY` | Shared secret for admin endpoints |

Set the same variables in the Netlify UI for production.

### 3. Database migration

In the Supabase SQL editor, run:

```text
supabase/migrations/0001_init.sql
```

This creates `tenants`, `documents`, `chat_history`, `rate_limits`, the `vector` extension, IVFFlat index, and `match_documents()`.

### 4. Local dev

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:8888/api/v1/health
# {"status":"ok"}
```

---

## Endpoints

All errors use a consistent shape:

```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

Common codes: `UNAUTHORIZED`, `VALIDATION_ERROR`, `INVALID_JSON`, `NOT_FOUND`, `RATE_LIMITED`, `INTERNAL_ERROR`, `METHOD_NOT_ALLOWED`.

---

### `GET /api/v1/health`

No auth. Liveness probe.

```bash
curl -s http://localhost:8888/api/v1/health
```

**Response:** `{ "status": "ok" }`

---

### `POST /api/v1/tenants` (admin)

Create a tenant. The `api_key` is returned **once** — store it securely.

**Headers:** `x-admin-key`, `Content-Type: application/json`

```bash
curl -s -X POST http://localhost:8888/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{
    "name": "Serengeti Trails",
    "system_prompt": "You are a helpful safari booking assistant for Serengeti Trails. Be concise and friendly."
  }'
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Serengeti Trails",
  "system_prompt": "...",
  "api_key": "hex-secret",
  "created_at": "..."
}
```

---

### `GET /api/v1/tenants/:id` (admin)

Fetch tenant metadata. **Never** returns `api_key`.

```bash
curl -s http://localhost:8888/api/v1/tenants/TENANT_UUID \
  -H "x-admin-key: $ADMIN_API_KEY"
```

**Response:** `{ "id", "name", "system_prompt", "created_at" }`

---

### `POST /api/v1/ingest` (admin)

Push pre-chunked knowledge base text (tour packages, FAQs, routes). Does not scrape or chunk.

**Headers:** `x-admin-key`, `Content-Type: application/json`

**Limits:** max 50 chunks per request; each chunk max 8000 characters.

```bash
curl -s -X POST http://localhost:8888/api/v1/ingest \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{
    "tenant_id": "TENANT_UUID",
    "chunks": [
      {
        "content": "3-day Serengeti safari from Arusha includes game drives and camping. From $890 per person.",
        "metadata": { "type": "package", "days": 3 }
      },
      {
        "content": "Kilimanjaro Marangu route is 5–6 days. Summit success is higher with acclimatization days.",
        "metadata": { "type": "route", "peak": "kilimanjaro" }
      }
    ]
  }'
```

**Response (201):** `{ "inserted": 2 }`

---

### `POST /api/v1/chat` (tenant)

RAG chat: embed → retrieve top 4 docs → generate → save history.

**Headers:** `x-api-key` (tenant key), `Content-Type: application/json`

**Limits:** `message` max 2000 characters; 30 requests per tenant per 60-second window.

```bash
curl -s -X POST http://localhost:8888/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TENANT_API_KEY" \
  -d '{
    "message": "How much is a 3-day Serengeti safari?",
    "session_id": "web-session-001"
  }'
```

**Response:**

```json
{
  "answer": "...",
  "sources": [
    {
      "id": "uuid",
      "content": "...",
      "metadata": {},
      "similarity": 0.82
    }
  ],
  "session_id": "web-session-001"
}
```

**429** when rate limited includes `Retry-After` and `{ "error", "code": "RATE_LIMITED" }`.

---

## Architecture (request flow)

```
Client
  │  x-api-key
  ▼
POST /api/v1/chat
  │
  ├─ auth → tenants table
  ├─ rate limit → rate_limits table
  ├─ embed(message) → Gemini embedding-001
  ├─ match_documents RPC → pgvector (tenant-scoped)
  ├─ askLLM → Groq Llama 3.1 → fallback Gemini
  ├─ insert chat_history (user + assistant)
  └─ JSON { answer, sources, session_id }
```

---

## Project layout

```
netlify/functions/     # health, chat, ingest, tenants (.mts)
src/lib/               # supabase, auth, embeddings, llm, admin, rate-limit, errors
src/types/             # shared TypeScript interfaces
supabase/migrations/   # SQL schema
public/                # static publish root for Netlify
```

---

## Notes

- Service role key bypasses RLS; keep it server-side only.
- IVFFlat index works best after you have data; re-run `ANALYZE documents` after large ingests if needed.
- No websockets or background workers — every request is synchronous.
- Dependencies are intentionally minimal: `@netlify/functions`, `@supabase/supabase-js`.

## License

MIT
