"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";

interface ChatSource {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

interface UiMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

const STORAGE_KEY = "tourism-rag-settings";

export default function DemoPage() {
  const [apiKey, setApiKey] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          apiKey?: string;
          sessionId?: string;
        };
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        else setSessionId(crypto.randomUUID());
      } else {
        setSessionId(crypto.randomUUID());
      }
    } catch {
      setSessionId(crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey, sessionId }));
  }, [apiKey, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(
    () => apiKey.trim().length > 0 && input.trim().length > 0 && !loading,
    [apiKey, input, loading]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    const text = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId || crypto.randomUUID(),
        }),
      });

      const data = (await res.json()) as {
        answer?: string;
        sources?: ChatSource[];
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "(empty answer)",
          sources: data.sources,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry — ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="demo-shell">
      <header>
        <p className="eyebrow">Live demo</p>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.6rem" }}>
          Safari & trek assistant
        </h1>
        <p className="muted small" style={{ margin: 0 }}>
          Paste a tenant API key from{" "}
          <Link href="/docs#post-tenants">POST /tenants</Link>. Simple UI only —
          full guide on <Link href="/docs">docs</Link>.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSessionId(crypto.randomUUID());
              setMessages([]);
              setError(null);
            }}
          >
            New session
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowSettings((v) => !v)}
          >
            {showSettings ? "Hide settings" : "Settings"}
          </button>
        </div>
      </header>

      {showSettings && (
        <section className="demo-settings">
          <label>
            Tenant API key
            <input
              type="password"
              autoComplete="off"
              placeholder="Tenant api_key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </label>
          <label>
            Session ID
            <input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </label>
        </section>
      )}

      <section className="demo-chat">
        {messages.length === 0 && (
          <p className="muted" style={{ textAlign: "center", margin: "2rem 0" }}>
            Ask about packages, routes, or prices from your ingested knowledge.
          </p>
        )}
        {messages.map((m, i) => (
          <article
            key={`${m.role}-${i}`}
            className={`bubble ${m.role === "user" ? "bubble-user" : "bubble-assistant"}`}
          >
            <span className="bubble-role">{m.role}</span>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            {m.sources && m.sources.length > 0 && (
              <details style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>
                <summary>Sources ({m.sources.length})</summary>
                <ul>
                  {m.sources.map((s) => (
                    <li key={s.id}>
                      <small>
                        similarity{" "}
                        {typeof s.similarity === "number"
                          ? s.similarity.toFixed(3)
                          : s.similarity}
                      </small>
                      <div>
                        {s.content.slice(0, 200)}
                        {s.content.length > 200 ? "…" : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
        {loading && (
          <div className="bubble bubble-assistant">
            <span className="bubble-role">assistant</span>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </section>

      {error && (
        <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      <form className="demo-composer" onSubmit={onSubmit}>
        <textarea
          rows={2}
          placeholder={
            apiKey ? "Message your tourism assistant…" : "Add API key in Settings"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={!canSend}>
          Send
        </button>
      </form>
    </main>
  );
}
