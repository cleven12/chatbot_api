# Tourism RAG API + Chat UI

Multi-tenant RAG chatbot for East African safari/trek operators.

- **API** — Next.js route handlers under `/api/v1/*`
- **Client** — chat UI at `/` (deployed together on Vercel)
- **DB** — Supabase Postgres + pgvector
- **Embeddings** — Gemini `embedding-001`
- **LLM** — Groq Llama 3.1 (primary), Gemini fallback

---

## Fix the RLS error first

If create-tenant fails with:

```text
new row violates row-level security policy for table "tenants"
```

you are almost always using the **anon** key instead of the **service_role** key.

1. Open Supabase → **Project Settings** → **API**
2. Copy **`service_role`** (secret) — not `anon` / `public`
3. Put it in `.env` as `SUPABASE_SERVICE_KEY`
4. Run SQL in Supabase SQL editor:
   - `supabase/migrations/0001_init.sql` (if not already)
   - `supabase/migrations/0002_fix_rls.sql`

Restart the app after updating `.env`.

---

## Local setup (Vercel / Next.js)

```bash
# clean old Netlify deps if you installed them earlier
rm -rf node_modules package-lock.json

npm install
cp .env.example .env
# fill SUPABASE_* (service_role!), GEMINI_*, GROQ_*, ADMIN_API_KEY

npm run dev
```

Open:

- UI: http://localhost:3000  
- Health: http://localhost:3000/api/v1/health  

---

## Deploy with Vercel CLI

```bash
# one-time
npx vercel login

# link project + set env vars when prompted, or:
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_KEY
npx vercel env add GEMINI_API_KEY
npx vercel env add GROQ_API_KEY
npx vercel env add ADMIN_API_KEY

# preview
npx vercel

# production
npx vercel --prod
# or: npm run deploy
```

In the Vercel dashboard you can also paste the same env vars under **Settings → Environment Variables**.

---

## Bootstrap a tenant

```bash
# 1) Create tenant (save api_key — shown once)
curl -s -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{
    "name": "Serengeti Trails",
    "system_prompt": "You are a helpful safari booking assistant for Serengeti Trails. Be concise and friendly."
  }'

# 2) Ingest knowledge chunks
curl -s -X POST http://localhost:3000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{
    "tenant_id": "TENANT_UUID",
    "chunks": [
      {
        "content": "3-day Serengeti safari from Arusha includes game drives and camping. From $890 per person.",
        "metadata": { "type": "package", "days": 3 }
      }
    ]
  }'

# 3) Chat (or use the web UI with the tenant api_key)
curl -s -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TENANT_API_KEY" \
  -d '{
    "message": "How much is a 3-day Serengeti safari?",
    "session_id": "web-session-001"
  }'
```

---

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/health` | none | Liveness |
| POST | `/api/v1/tenants` | `x-admin-key` | Create tenant (returns `api_key` once) |
| GET | `/api/v1/tenants/:id` | `x-admin-key` | Tenant metadata (no key) |
| POST | `/api/v1/ingest` | `x-admin-key` | Insert embedded chunks |
| POST | `/api/v1/chat` | `x-api-key` | RAG chat |

Errors always look like: `{ "error": "...", "code": "..." }`.

---

## Project layout

```
app/
  page.tsx                 # chat client
  api/v1/health|chat|ingest|tenants/
src/lib/                   # supabase, auth, embeddings, llm, rate-limit
src/types/
supabase/migrations/
```

Legacy Netlify function files under `netlify/` are unused; Vercel is the deploy target.

---

## Notes

- Never put `SUPABASE_SERVICE_KEY` or `ADMIN_API_KEY` in the browser or `NEXT_PUBLIC_*`.
- The chat UI only stores the **tenant** API key in `localStorage`.
- Rate limit: 30 chat requests / tenant / 60s.
- Message max length: 2000 characters.
