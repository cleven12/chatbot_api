import type { Metadata } from "next";
import Link from "next/link";
import { ContactStrip } from "@/components/ContactStrip";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Tourism chatbot API for safari & trek operators | Tour RAG API",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const base = siteConfig.url;

  return (
    <main className="page">
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="eyebrow">East Africa · Multi-tenant RAG</p>
          <h1 id="hero-title">
            Chatbot API for safari & trek websites
          </h1>
          <p className="hero-lead">
            {siteConfig.description} Integrate once — each tour company gets
            its own API key, system prompt, and knowledge base for packages,
            routes, and FAQs.
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/docs">
              Read API docs
            </Link>
            <Link className="btn btn-ghost" href="/demo">
              Try live demo
            </Link>
            <Link className="btn btn-ghost" href="/integrate">
              Add to your website
            </Link>
          </div>
        </div>
        <aside className="hero-card" aria-label="API base URL">
          <p className="eyebrow" style={{ color: "#b7f0d4" }}>
            Production base URL
          </p>
          <p style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>
            <code>{base}/api/v1</code>
          </p>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem" }}>
            Live on Vercel · Docs-first MVP for operators and developers who
            need a tourism AI assistant without building RAG from scratch.
          </p>
        </aside>
      </section>

      <section className="grid-3" aria-label="Product highlights">
        <article className="card">
          <h3>Multi-tenant by design</h3>
          <p>
            Isolate every operator: Serengeti safari, Kilimanjaro trek, Zanzibar
            stay — each tenant has its own key and documents.
          </p>
        </article>
        <article className="card">
          <h3>Simple HTTP API</h3>
          <p>
            Synchronous chat: authenticate, embed, retrieve, generate. No
            websockets. Easy to call from WordPress, Next.js, or a static site.
          </p>
        </article>
        <article className="card">
          <h3>Built for tourism content</h3>
          <p>
            Ingest tour packages, park fees FAQs, routes, and packing lists —
            then answer guests 24/7 in your brand voice.
          </p>
        </article>
      </section>

      <section className="section seo-block" aria-labelledby="who-title">
        <h2 id="who-title">
          Who uses a tourism RAG chatbot in East Africa?
        </h2>
        <p>
          <strong>Tour RAG API</strong> helps travel businesses across{" "}
          <strong>Tanzania</strong>, <strong>Kenya</strong>,{" "}
          <strong>Uganda</strong>, <strong>Rwanda</strong>, and the wider region
          put an intelligent assistant on their website. Searchers looking for a{" "}
          <em>safari chatbot</em>, <em>Kilimanjaro trek assistant</em>,{" "}
          <em>Serengeti booking AI</em>, or <em>tour operator chatbot API</em>{" "}
          can evaluate this MVP, then contact the developer for production
          setup.
        </p>
        <ul>
          <li>Safari & wildlife operators (Serengeti, Masai Mara, Ngorongoro)</li>
          <li>Mountain & trek companies (Kilimanjaro, Mount Meru, Rwenzori)</li>
          <li>Coastal & island tourism (Zanzibar, Mombasa beach packages)</li>
          <li>DMCs and booking agencies embedding chat on client microsites</li>
          <li>Agencies building multi-tenant tourism SaaS products</li>
        </ul>
      </section>

      <section className="section" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <div className="grid-3">
          <article className="card">
            <h3>1. Create a tenant</h3>
            <p>
              Admin call <code>POST /api/v1/tenants</code> with your company name
              and system prompt. Store the returned API key once.
            </p>
          </article>
          <article className="card">
            <h3>2. Ingest knowledge</h3>
            <p>
              Push chunked text for itineraries and FAQs via{" "}
              <code>POST /api/v1/ingest</code>. Embeddings land in Postgres +
              pgvector.
            </p>
          </article>
          <article className="card">
            <h3>3. Chat from your site</h3>
            <p>
              Your frontend calls <code>POST /api/v1/chat</code> with{" "}
              <code>x-api-key</code>. Guests get grounded answers plus optional
              source snippets.
            </p>
          </article>
        </div>
        <div className="btn-row">
          <Link className="btn btn-primary" href="/docs#quick-start">
            Quick start guide
          </Link>
          <Link className="btn btn-ghost" href="/docs#post-chat">
            Chat endpoint reference
          </Link>
        </div>
      </section>

      <section className="section seo-block" aria-labelledby="keywords-title">
        <h2 id="keywords-title">
          Tourism AI API · keywords operators actually search
        </h2>
        <p>
          If you are googling how to <strong>add AI chat to a safari website</strong>,
          build a <strong>multi-tenant travel chatbot</strong>, or integrate a{" "}
          <strong>RAG API for tour packages</strong>, this product is aimed at
          you. Common intents we target for discovery:
        </p>
        <p className="small muted">
          {siteConfig.keywords.join(" · ")}
        </p>
      </section>

      <section className="section faq" aria-labelledby="faq-title">
        <h2 id="faq-title">FAQ</h2>
        <details>
          <summary>Is this ready for other developers to consume?</summary>
          <p className="muted">
            Yes — this is an MVP demo API with public documentation, health
            checks, tenant isolation, and a live base URL at{" "}
            <code>{base}</code>. Use the docs to integrate; contact <a href="https://github.com/yusra1ally">Yusra</a> or <a href="https://github.com/cleven12">Cleven</a> for
            production hardening and custom setups.
          </p>
        </details>
        <details>
          <summary>Do I need LangChain or a separate vector database?</summary>
          <p className="muted">
            No. Embeddings and chat history live in Supabase Postgres with
            pgvector. The API uses plain HTTP to Gemini (embeddings) and Groq
            (LLM) with a Gemini fallback.
          </p>
        </details>
        <details>
          <summary>Can I embed this on my WordPress or static site?</summary>
          <p className="muted">
            Yes. Any stack that can call HTTPS can use the chat endpoint. See{" "}
            <Link href="/integrate">website integration</Link> for a minimal
            widget snippet.
          </p>
        </details>
        <details>
          <summary>How do I reach the developer?</summary>
          <p className="muted">
            Call, WhatsApp, email, or GitHub — contact strip below. Phone:{" "}
            {siteConfig.author.phone}.
          </p>
        </details>
      </section>

      <ContactStrip />
    </main>
  );
}
