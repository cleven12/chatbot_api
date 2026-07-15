import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ContactStrip } from "@/components/ContactStrip";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "API documentation — quick start & reference",
  description:
    "Tour RAG API docs: authentication, tenants, ingest, chat endpoints, curl examples, error codes. Integrate a multi-tenant tourism chatbot into your East Africa safari website.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Tour RAG API documentation",
    description:
      "Developer guide for multi-tenant tourism RAG chat API — quick start, endpoints, headers, and curl samples.",
  },
};

const base = siteConfig.url;
const api = `${base}/api/v1`;

export default function DocsPage() {
  return (
    <div className="docs-layout">
      <nav className="docs-toc" aria-label="On this page">
        <strong className="small">On this page</strong>
        <a href="#welcome">Welcome</a>
        <a href="#quick-start">Quick start</a>
        <a href="#auth">Authentication</a>
        <a href="#errors">Errors</a>
        <a href="#get-health">GET health</a>
        <a href="#post-tenants">POST tenants</a>
        <a href="#get-tenant">GET tenant</a>
        <a href="#post-ingest">POST ingest</a>
        <a href="#post-chat">POST chat</a>
        <a href="#limits">Limits</a>
        <a href="#next">Next steps</a>
      </nav>

      <article className="docs-main">
        <p className="eyebrow">Developer guide</p>
        <h1 id="welcome">Tour RAG API documentation</h1>
        <p className="muted">
          Multi-tenant RAG chatbot backend for East African tourism companies.
          One deployment, many operators — each with an API key, system prompt,
          and knowledge base. Designed so other products and websites can
          consume the API as a demo / MVP.
        </p>

        <div className="callout">
          <strong>Base URL (production):</strong>{" "}
          <code>{api}</code>
          <br />
          Interactive demo: <Link href="/demo">/demo</Link> · Website snippet:{" "}
          <Link href="/integrate">/integrate</Link>
        </div>

        <h2 id="quick-start">Quick start</h2>
        <p>
          Same flow as most payment / platform docs: create credentials → push
          data → call the action endpoint.
        </p>
        <ol>
          <li>
            <strong>Create a tenant</strong> with admin key → receive{" "}
            <code>api_key</code> once.
          </li>
          <li>
            <strong>Ingest chunks</strong> (tour packages, FAQs, routes).
          </li>
          <li>
            <strong>Chat</strong> with the tenant <code>x-api-key</code>.
          </li>
        </ol>

        <div className="code-block">
          <code>{`# 1) Create tenant
curl -s -X POST ${api}/tenants \\
  -H "Content-Type: application/json" \\
  -H "x-admin-key: $ADMIN_API_KEY" \\
  -d '{
    "name": "Serengeti Trails",
    "system_prompt": "You are a helpful safari booking assistant. Be concise."
  }'

# 2) Ingest knowledge
curl -s -X POST ${api}/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-admin-key: $ADMIN_API_KEY" \\
  -d '{
    "tenant_id": "TENANT_UUID",
    "chunks": [
      {
        "content": "3-day Serengeti safari from Arusha. From $890 pp.",
        "metadata": { "type": "package", "days": 3 }
      }
    ]
  }'

# 3) Chat as the tenant
curl -s -X POST ${api}/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $TENANT_API_KEY" \\
  -d '{
    "message": "How much is a 3-day Serengeti safari?",
    "session_id": "web-session-001"
  }'`}</code>
        </div>

        <h2 id="auth">Authentication</h2>
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Header</th>
                <th>Used by</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>x-admin-key</code>
                </td>
                <td>Tenants, Ingest</td>
                <td>Server secret from env <code>ADMIN_API_KEY</code></td>
              </tr>
              <tr>
                <td>
                  <code>x-api-key</code>
                </td>
                <td>Chat</td>
                <td>Per-tenant key returned on create (shown once)</td>
              </tr>
              <tr>
                <td>
                  <code>Content-Type</code>
                </td>
                <td>All POST</td>
                <td>
                  <code>application/json</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="errors">Errors</h2>
        <p>All failures share one shape (easy for clients to parse):</p>
        <div className="code-block">
          <code>{`{
  "error": "Human-readable message",
  "code": "MACHINE_CODE"
}`}</code>
        </div>
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>HTTP</th>
                <th>code</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>400</td>
                <td>
                  <code>VALIDATION_ERROR</code>, <code>INVALID_JSON</code>
                </td>
                <td>Missing fields / bad body</td>
              </tr>
              <tr>
                <td>401</td>
                <td>
                  <code>UNAUTHORIZED</code>
                </td>
                <td>Bad or missing API / admin key</td>
              </tr>
              <tr>
                <td>404</td>
                <td>
                  <code>NOT_FOUND</code>
                </td>
                <td>Unknown tenant</td>
              </tr>
              <tr>
                <td>429</td>
                <td>
                  <code>RATE_LIMITED</code>
                </td>
                <td>Chat window exceeded (Retry-After header)</td>
              </tr>
              <tr>
                <td>500</td>
                <td>
                  <code>INTERNAL_ERROR</code>, <code>EMBEDDING_ERROR</code>, …
                </td>
                <td>Upstream or server failure</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EndpointBlock
          id="get-health"
          method="GET"
          path="/api/v1/health"
          auth="None"
          summary="Liveness probe. Use for uptime checks and load balancers."
        >
          <div className="code-block">
            <code>{`curl -s ${api}/health
# {"status":"ok"}`}</code>
          </div>
        </EndpointBlock>

        <EndpointBlock
          id="post-tenants"
          method="POST"
          path="/api/v1/tenants"
          auth="x-admin-key"
          summary="Create a tenant (tourism company). The api_key is returned only in this response — store it securely."
        >
          <h3>Request body</h3>
          <div className="code-block">
            <code>{`{
  "name": "Serengeti Trails",
  "system_prompt": "You are a helpful safari booking assistant..."
}`}</code>
          </div>
          <h3>Response 201</h3>
          <div className="code-block">
            <code>{`{
  "id": "uuid",
  "name": "Serengeti Trails",
  "system_prompt": "...",
  "api_key": "hex-secret",
  "created_at": "..."
}`}</code>
          </div>
        </EndpointBlock>

        <EndpointBlock
          id="get-tenant"
          method="GET"
          path="/api/v1/tenants/:id"
          auth="x-admin-key"
          summary="Fetch tenant metadata. Never returns api_key after creation."
        >
          <div className="code-block">
            <code>{`curl -s ${api}/tenants/TENANT_UUID \\
  -H "x-admin-key: $ADMIN_API_KEY"`}</code>
          </div>
        </EndpointBlock>

        <EndpointBlock
          id="post-ingest"
          method="POST"
          path="/api/v1/ingest"
          auth="x-admin-key"
          summary="Push pre-chunked knowledge base text. The API embeds each chunk and stores vectors in Postgres (pgvector). It does not scrape or split documents for you."
        >
          <h3>Request body</h3>
          <div className="code-block">
            <code>{`{
  "tenant_id": "uuid",
  "chunks": [
    {
      "content": "string (max 8000 chars)",
      "metadata": { "any": "json object" }
    }
  ]
}`}</code>
          </div>
          <h3>Response 201</h3>
          <div className="code-block">
            <code>{`{ "inserted": 2 }`}</code>
          </div>
          <p className="muted small">
            Limits: max 50 chunks per request; each chunk max 8000 characters.
          </p>
        </EndpointBlock>

        <EndpointBlock
          id="post-chat"
          method="POST"
          path="/api/v1/chat"
          auth="x-api-key (tenant)"
          summary="RAG chat: embed message → retrieve top documents for that tenant → generate answer → save history."
        >
          <h3>Request body</h3>
          <div className="code-block">
            <code>{`{
  "message": "How much is a 3-day Serengeti safari?",
  "session_id": "web-session-001"
}`}</code>
          </div>
          <h3>Response 200</h3>
          <div className="code-block">
            <code>{`{
  "answer": "A 3-day Serengeti safari costs $890 per person.",
  "sources": [
    {
      "id": "uuid",
      "content": "...",
      "metadata": {},
      "similarity": 0.76
    }
  ],
  "session_id": "web-session-001"
}`}</code>
          </div>
        </EndpointBlock>

        <h2 id="limits">Limits & behaviour</h2>
        <ul>
          <li>
            <strong>Message length:</strong> max 2000 characters on chat.
          </li>
          <li>
            <strong>Rate limit:</strong> 30 chat requests / tenant / 60 seconds.
          </li>
          <li>
            <strong>Retrieval:</strong> top 4 documents by cosine similarity.
          </li>
          <li>
            <strong>LLM:</strong> Groq Llama 3.3 70B primary, Gemini fallback.
          </li>
          <li>
            <strong>Embeddings:</strong> Gemini <code>gemini-embedding-001</code>{" "}
            @ 768 dimensions.
          </li>
        </ul>

        <h3 id="capacity">Ingest capacity (tokens / full website)</h3>
        <div className="table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Limit</th>
                <th>Value</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chunk size</td>
                <td>8,000 chars</td>
                <td>~1.5–2k tokens each (rule of thumb)</td>
              </tr>
              <tr>
                <td>Chunks / request</td>
                <td>50</td>
                <td>Repeat calls to add more</td>
              </tr>
              <tr>
                <td>Max per request</td>
                <td>~400k chars</td>
                <td>50 × 8,000 — still constrained by function timeout</td>
              </tr>
              <tr>
                <td>DB hard cap</td>
                <td>None in app code</td>
                <td>Postgres/Supabase plan + embedding cost</td>
              </tr>
              <tr>
                <td>~1,000 web pages</td>
                <td>Possible after chunking</td>
                <td>
                  Scrape → clean → chunk → many ingest batches. Prefer FAQs &amp;
                  packages first for sales demos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted">
          Vectors are not “tokens stored forever” — each chunk is one 768-dim
          embedding. Chat only retrieves the top 4 nearest chunks, so quality of
          chunks matters more than raw page count.
        </p>

        <h2 id="next">Next steps</h2>
        <div className="btn-row">
          <Link className="btn btn-primary" href="/integrate">
            Embed on a website
          </Link>
          <Link className="btn btn-ghost" href="/demo">
            Open live demo
          </Link>
          <a className="btn btn-ghost" href={siteConfig.social.github}>
            View source on GitHub
          </a>
        </div>

        <ContactStrip />
      </article>
    </div>
  );
}

function EndpointBlock({
  id,
  method,
  path,
  auth,
  summary,
  children,
}: {
  id: string;
  method: "GET" | "POST";
  path: string;
  auth: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <h2>
        <span className="badge">{method === "GET" ? "Read" : "Write"}</span>{" "}
        {path}
      </h2>
      <div className="endpoint">
        <span className={`method method-${method.toLowerCase()}`}>{method}</span>
        <span>{path}</span>
      </div>
      <p>
        <strong>Auth:</strong> {auth}
      </p>
      <p>{summary}</p>
      {children}
    </section>
  );
}
