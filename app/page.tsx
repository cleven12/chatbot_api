"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

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

export default function HomePage() {
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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ apiKey, sessionId })
    );
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
        code?: string;
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
        {
          role: "assistant",
          content: `Sorry — ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newSession() {
    const id = crypto.randomUUID();
    setSessionId(id);
    setMessages([]);
    setError(null);
  }

  return (
    <main style={styles.shell}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>East Africa tourism</p>
          <h1 style={styles.title}>Safari & trek assistant</h1>
        </div>
        <div style={styles.headerActions}>
          <button type="button" style={styles.ghostBtn} onClick={newSession}>
            New session
          </button>
          <button
            type="button"
            style={styles.ghostBtn}
            onClick={() => setShowSettings((v) => !v)}
          >
            {showSettings ? "Hide settings" : "Settings"}
          </button>
        </div>
      </header>

      {showSettings && (
        <section style={styles.settings}>
          <label style={styles.label}>
            Tenant API key
            <input
              style={styles.input}
              type="password"
              autoComplete="off"
              placeholder="Paste tenant api_key from POST /api/v1/tenants"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </label>
          <label style={styles.label}>
            Session ID
            <input
              style={styles.input}
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </label>
          <p style={styles.hint}>
            Keys stay in your browser localStorage only. Create a tenant with{" "}
            <code>x-admin-key</code>, ingest docs, then chat here.
          </p>
        </section>
      )}

      <section style={styles.chat}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <p>Ask about routes, packages, prices, or packing tips.</p>
            <p style={styles.hint}>
              Example: “How much is a 3-day Serengeti safari?”
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <article
            key={`${m.role}-${i}`}
            style={{
              ...styles.bubble,
              ...(m.role === "user" ? styles.userBubble : styles.assistantBubble),
            }}
          >
            <span style={styles.role}>{m.role}</span>
            <div style={styles.content}>{m.content}</div>
            {m.sources && m.sources.length > 0 && (
              <details style={styles.sources}>
                <summary>Sources ({m.sources.length})</summary>
                <ul>
                  {m.sources.map((s) => (
                    <li key={s.id}>
                      <small>
                        similarity {s.similarity?.toFixed?.(3) ?? s.similarity}
                      </small>
                      <div>{s.content.slice(0, 220)}
                        {s.content.length > 220 ? "…" : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
            <span style={styles.role}>assistant</span>
            <div style={styles.content}>Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </section>

      {error && <p style={styles.error}>{error}</p>}

      <form style={styles.composer} onSubmit={onSubmit}>
        <textarea
          style={styles.textarea}
          rows={2}
          placeholder={
            apiKey
              ? "Message your tourism assistant…"
              : "Add a tenant API key in Settings first"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" style={styles.sendBtn} disabled={!canSend}>
          Send
        </button>
      </form>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    maxWidth: 760,
    margin: "0 auto",
    minHeight: "100vh",
    padding: "1.25rem 1rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    color: "var(--accent)",
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0.2rem 0 0",
    fontSize: "1.55rem",
    fontWeight: 650,
  },
  headerActions: {
    display: "flex",
    gap: "0.5rem",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "0.45rem 0.9rem",
    color: "var(--text-muted)",
  },
  settings: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "1rem",
    display: "grid",
    gap: "0.75rem",
  },
  label: {
    display: "grid",
    gap: "0.35rem",
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  input: {
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "0.65rem 0.75rem",
    outline: "none",
  },
  hint: {
    margin: 0,
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    lineHeight: 1.45,
  },
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    minHeight: 280,
  },
  empty: {
    margin: "auto 0",
    textAlign: "center",
    color: "var(--text-muted)",
  },
  bubble: {
    borderRadius: "var(--radius)",
    padding: "0.85rem 1rem",
    border: "1px solid var(--border)",
    maxWidth: "92%",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "var(--user-bubble)",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    background: "var(--assistant-bubble)",
  },
  role: {
    display: "block",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--text-muted)",
    marginBottom: "0.35rem",
  },
  content: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  sources: {
    marginTop: "0.75rem",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  composer: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.6rem",
    alignItems: "end",
    position: "sticky",
    bottom: 0,
    background: "linear-gradient(transparent, var(--bg) 30%)",
    paddingTop: "0.5rem",
  },
  textarea: {
    resize: "vertical",
    minHeight: 56,
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "0.75rem 0.9rem",
    outline: "none",
  },
  sendBtn: {
    background: "var(--accent)",
    color: "#062416",
    border: "none",
    borderRadius: "var(--radius)",
    padding: "0.75rem 1.15rem",
    fontWeight: 650,
    height: 48,
  },
  error: {
    color: "var(--danger)",
    margin: 0,
    fontSize: "0.9rem",
  },
};
