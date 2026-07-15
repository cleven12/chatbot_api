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
        <h2>3. Drop-in HTML demo widget</h2>
        <p className="muted">
          Paste near the end of <code>&lt;body&gt;</code> on a tour landing
          page. Replace <code>YOUR_TENANT_KEY</code>.
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
