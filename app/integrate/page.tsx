import type { Metadata } from "next";
import Link from "next/link";
import { ContactStrip } from "@/components/ContactStrip";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Integrate tourism chatbot on your website",
  description:
    "Embed Tour RAG API chat on safari, Kilimanjaro, and hotel websites. Minimal JavaScript widget, fetch examples, and multi-tenant API keys for East African tour operators.",
  alternates: { canonical: "/integrate" },
};

const api = `${siteConfig.url}/api/v1`;

export default function IntegratePage() {
  return (
    <main className="page">
      <p className="eyebrow">Website integration</p>
      <h1>Add the tourism chatbot to your site</h1>
      <p className="hero-lead">
        Use the same API from a WordPress site, Next.js app, static HTML, or
        mobile client. Guests ask about packages; your knowledge base answers.
      </p>

      <section className="section">
        <h2>1. Keep the tenant key server-side when you can</h2>
        <p className="muted">
          For production, proxy chat through your backend so the tenant{" "}
          <code>api_key</code> is not exposed in browser source. For demos, the
          key can live in the client (as on <Link href="/demo">/demo</Link>).
        </p>
      </section>

      <section className="section">
        <h2>2. Minimal browser fetch</h2>
        <div className="code-block">
          <code>{`async function askTourBot(message, sessionId, apiKey) {
  const res = await fetch("${api}/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Chat failed");
  }
  return res.json(); // { answer, sources, session_id }
}`}</code>
        </div>
      </section>

      <section className="section">
        <h2>3. Floating chat bubble (recommended)</h2>
        <p className="muted">
          One script tag — same style operators expect (bottom-right bubble).
          Hosted at <code>{siteConfig.url}/tour-rag-widget.js</code>. Preview it
          on <Link href="/demo">/demo</Link> after pasting a tenant key.
        </p>
        <div className="code-block">
          <code>{`<!-- Paste before </body> on WordPress / HTML / any site -->
<script
  src="${siteConfig.url}/tour-rag-widget.js"
  data-api-key="YOUR_TENANT_API_KEY"
  data-title="Safari Assistant"
  data-subtitle="Ask about tours & packages"
  data-welcome="Hi! Ask about safaris, Kilimanjaro, or prices."
  data-primary="#0d8f5b"
  data-api-base="${api}"
  defer
></script>`}</code>
        </div>
        <p className="muted small">
          Brand it with <code>data-primary</code> (hex color),{" "}
          <code>data-title</code>, and <code>data-welcome</code>. For production
          traffic, proxy chat through your server so the key is not public.
        </p>
      </section>

      <section className="section">
        <h2>4. Inline panel (optional)</h2>
        <p className="muted">
          If you prefer a fixed chat box in the page (not a floating bubble):
        </p>
        <div className="code-block">
          <code>{`<div id="tour-rag-chat" style="max-width:420px;font-family:system-ui">
  <div id="tour-rag-log" style="min-height:120px;border:1px solid #ddd;padding:12px;border-radius:12px"></div>
  <form id="tour-rag-form" style="display:flex;gap:8px;margin-top:8px">
    <input id="tour-rag-input" placeholder="Ask about safaris..." style="flex:1;padding:10px" />
    <button type="submit">Send</button>
  </form>
</div>
<script>
(function () {
  var KEY = "YOUR_TENANT_KEY";
  var SID = "site-" + Math.random().toString(36).slice(2);
  var log = document.getElementById("tour-rag-log");
  document.getElementById("tour-rag-form").onsubmit = async function (e) {
    e.preventDefault();
    var input = document.getElementById("tour-rag-input");
    var msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    log.innerHTML += "<p><b>You:</b> " + msg + "</p>";
    var res = await fetch("${api}/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": KEY },
      body: JSON.stringify({ message: msg, session_id: SID })
    });
    var data = await res.json();
    log.innerHTML += "<p><b>Assistant:</b> " + (data.answer || data.error) + "</p>";
  };
})();
</script>`}</code>
        </div>
      </section>

      <section className="section seo-block">
        <h2>How much content can one tenant ingest?</h2>
        <p>
          <strong>Per request:</strong> up to <strong>50 chunks</strong>, each
          up to <strong>8,000 characters</strong> (~1.5–2k tokens per chunk
          roughly). Call ingest many times to grow the knowledge base.
        </p>
        <p>
          <strong>Whole website with ~1,000 pages?</strong> Yes in principle —
          but not as one raw dump. Scrape → clean → split into chunks (~500–1,500
          words) → batch ingest (e.g. 20–50 chunks per request). Expect on the
          order of <strong>thousands of vectors</strong> for a large site, not
          one vector per full page.
        </p>
        <p className="muted small">
          Practical limits today: Gemini embedding rate limits, Vercel function
          time (embed each chunk in series), Supabase storage, and retrieval
          quality (we only return the top 4 matches per question). For sales
          demos, start with 20–100 high-value FAQ/package chunks — not 1,000
          noisy HTML pages.
        </p>
      </section>

      <section className="section seo-block">
        <h2>SEO tip for operators</h2>
        <p>
          When you embed chat, still keep crawlable FAQ pages for{" "}
          <em>Kilimanjaro routes</em>, <em>Serengeti packages</em>, and park
          fees. The chatbot improves conversion; public HTML pages improve
          Google rankings. Point your sitemap at both.
        </p>
      </section>

      <div className="btn-row">
        <Link className="btn btn-primary" href="/docs">
          Full API reference
        </Link>
        <Link className="btn btn-ghost" href="/demo">
          Try the hosted demo
        </Link>
      </div>

      <ContactStrip />
    </main>
  );
}
