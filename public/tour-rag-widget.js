/**
 * Tour RAG floating chat widget (zero deps IIFE)
 *
 * <script
 *   src="https://tourragapi.vercel.app/tour-rag-widget.js"
 *   data-api-key="YOUR_TENANT_KEY"
 *   data-api-base="https://tourragapi.vercel.app/api/v1"
 *   data-title="Safari Assistant"
 *   data-primary="#0d8f5b"
 *   defer
 * ></script>
 */
(function () {
  "use strict";

  if (window.__TOUR_RAG_WIDGET_LOADED__) return;
  window.__TOUR_RAG_WIDGET_LOADED__ = true;

  var MAX_MESSAGE_LENGTH = 2000;
  var DEFAULT_API_BASE = "https://tourragapi.vercel.app/api/v1";

  function readConfig(script) {
    var ds = (script && script.dataset) || {};
    var cfg = window.TourRAGConfig || {};
    var base = cfg.apiBase || ds.apiBase || DEFAULT_API_BASE;
    return {
      apiBase: String(base).replace(/\/$/, ""),
      apiKey: cfg.apiKey || ds.apiKey || "",
      title: cfg.title || ds.title || "Tour Assistant",
      subtitle: cfg.subtitle || ds.subtitle || "Online · replies instantly",
      welcome:
        cfg.welcome ||
        ds.welcome ||
        "Hi! Ask about safaris, treks, packages, or prices.",
      primary: cfg.primary || ds.primary || "#0d8f5b",
      avatar: String(cfg.avatar || ds.avatar || "T")
        .slice(0, 2)
        .toUpperCase(),
      storageKey: cfg.storageKey || ds.storageKey || "tour_rag_widget_session",
      position: cfg.position || ds.position || "right",
    };
  }

  function currentScript() {
    return (
      document.currentScript ||
      document.querySelector('script[src*="tour-rag-widget.js"]')
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function genId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function injectStyles(primary, position) {
    if (document.getElementById("tour-rag-widget-styles")) return;
    var side = position === "left" ? "left" : "right";
    var style = document.createElement("style");
    style.id = "tour-rag-widget-styles";
    style.textContent =
      "#tourrag-btn{position:fixed;bottom:24px;" +
      side +
      ":24px;z-index:99999;width:56px;height:56px;border-radius:50%;" +
      "background:" +
      primary +
      ";border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.22);" +
      "display:flex;align-items:center;justify-content:center;transition:transform .2s}" +
      "#tourrag-btn:hover{transform:scale(1.07)}" +
      "#tourrag-btn svg{width:26px;height:26px;fill:#fff}" +
      "#tourrag-box{position:fixed;bottom:90px;" +
      side +
      ":16px;z-index:99999;width:calc(100vw - 32px);max-width:360px;" +
      "border-radius:14px;overflow:hidden;box-shadow:0 10px 36px rgba(0,0,0,.18);" +
      "font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;" +
      "display:none;flex-direction:column;background:#fff;color:#12201a}" +
      "#tourrag-box.open{display:flex}" +
      "#tourrag-header{background:" +
      primary +
      ";color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}" +
      "#tourrag-header .info{display:flex;align-items:center;gap:10px}" +
      "#tourrag-header .avatar{width:36px;height:36px;border-radius:50%;background:#fff;" +
      "display:flex;align-items:center;justify-content:center;font-weight:700;color:" +
      primary +
      ";font-size:13px}" +
      "#tourrag-header .name{font-weight:600;font-size:14px}" +
      "#tourrag-header .sub{font-size:11px;opacity:.8}" +
      "#tourrag-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1}" +
      "#tourrag-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;" +
      "gap:10px;min-height:280px;max-height:min(380px,50vh);background:#f4f7f5}" +
      "#tourrag-messages::-webkit-scrollbar{width:6px}" +
      "#tourrag-messages::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}" +
      ".tourrag-msg{max-width:84%;padding:9px 12px;border-radius:10px;line-height:1.5;" +
      "white-space:pre-wrap;word-break:break-word}" +
      ".tourrag-msg.bot{align-self:flex-start;background:#fff;color:#222;" +
      "border:1px solid #e5e7eb;border-radius:2px 10px 10px 10px}" +
      ".tourrag-msg.user{align-self:flex-end;background:" +
      primary +
      ";color:#fff;border-radius:10px 2px 10px 10px}" +
      ".tourrag-msg.typing{color:#888;font-style:italic}" +
      ".tourrag-msg.error{border-color:#f0c0c0;color:#8a2a2a}" +
      "#tourrag-input-row{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #e5e7eb;background:#fff}" +
      "#tourrag-input{flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:20px;" +
      "outline:none;font-size:13px;font-family:inherit}" +
      "#tourrag-input:focus{border-color:" +
      primary +
      "}" +
      "#tourrag-send{width:36px;height:36px;border-radius:50%;background:" +
      primary +
      ";border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}" +
      "#tourrag-send svg{width:16px;height:16px;fill:#fff}" +
      "#tourrag-send:disabled,#tourrag-input:disabled{opacity:.4;cursor:not-allowed}" +
      "#tourrag-clear{font-size:11px;color:#888;background:none;border:none;cursor:pointer;" +
      "padding:0 12px 8px;text-align:right;display:block;width:100%}" +
      "#tourrag-clear:hover{color:" +
      primary +
      "}" +
      "#tourrag-powered{font-size:10px;color:#9aa8a0;text-align:center;padding:0 8px 8px;background:#fff}" +
      "#tourrag-powered a{color:#5c6f66}" +
      "@media (max-width:420px){#tourrag-box{bottom:84px;" +
      side +
      ":16px;width:calc(100vw - 32px)}#tourrag-btn{bottom:16px;" +
      side +
      ":16px}}";
    document.head.appendChild(style);
  }

  function addMsg(container, roleClass, text) {
    var div = document.createElement("div");
    div.className = "tourrag-msg " + roleClass;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function mount(config) {
    if (document.getElementById("tourrag-btn")) return;

    injectStyles(config.primary, config.position);

    var btn = document.createElement("button");
    btn.id = "tourrag-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Open chat");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>';

    var box = document.createElement("div");
    box.id = "tourrag-box";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", config.title);
    box.innerHTML =
      '<div id="tourrag-header">' +
      '<div class="info">' +
      '<div class="avatar">' +
      escapeHtml(config.avatar) +
      "</div>" +
      "<div>" +
      '<div class="name">' +
      escapeHtml(config.title) +
      "</div>" +
      '<div class="sub">' +
      escapeHtml(config.subtitle) +
      "</div>" +
      "</div></div>" +
      '<button id="tourrag-close" type="button" aria-label="Close">&#x2715;</button>' +
      "</div>" +
      '<div id="tourrag-messages"></div>' +
      '<button id="tourrag-clear" type="button">Clear conversation</button>' +
      '<div id="tourrag-input-row">' +
      '<input id="tourrag-input" type="text" placeholder="Ask something..." autocomplete="off" maxlength="' +
      MAX_MESSAGE_LENGTH +
      '" />' +
      '<button id="tourrag-send" type="button" aria-label="Send">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>' +
      "</button></div>" +
      '<div id="tourrag-powered">Powered by <a href="https://tourragapi.vercel.app" target="_blank" rel="noopener">Tour RAG API</a></div>';

    document.body.appendChild(btn);
    document.body.appendChild(box);

    var messages = box.querySelector("#tourrag-messages");
    var input = box.querySelector("#tourrag-input");
    var send = box.querySelector("#tourrag-send");
    var closeBtn = box.querySelector("#tourrag-close");
    var clearBtn = box.querySelector("#tourrag-clear");
    var loading = false;

    var sessionId = localStorage.getItem(config.storageKey) || "";
    if (!sessionId) {
      sessionId = genId();
      localStorage.setItem(config.storageKey, sessionId);
    }

    function showWelcome() {
      messages.innerHTML = "";
      addMsg(messages, "bot", config.welcome);
      if (!config.apiKey) {
        addMsg(
          messages,
          "bot error",
          "Missing tenant API key. Set data-api-key on the script tag or window.TourRAGConfig.apiKey."
        );
      }
    }

    showWelcome();

    btn.addEventListener("click", function () {
      var open = box.classList.toggle("open");
      if (open) input.focus();
    });
    closeBtn.addEventListener("click", function () {
      box.classList.remove("open");
    });

    function setLoading(on) {
      loading = on;
      send.disabled = on;
      input.disabled = on;
    }

    async function sendMessage() {
      if (loading) return;
      var q = input.value.trim();
      if (!q) return;

      if (!config.apiKey) {
        addMsg(
          messages,
          "bot error",
          "Missing tenant API key. Set data-api-key on the script tag or window.TourRAGConfig.apiKey."
        );
        return;
      }

      if (q.length > MAX_MESSAGE_LENGTH) {
        addMsg(
          messages,
          "bot error",
          "Message must be at most " + MAX_MESSAGE_LENGTH + " characters."
        );
        return;
      }

      addMsg(messages, "user", q);
      input.value = "";
      setLoading(true);
      var typing = addMsg(messages, "bot typing", "Typing…");

      try {
        var res = await fetch(config.apiBase + "/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
          },
          body: JSON.stringify({
            message: q,
            session_id: sessionId,
          }),
        });

        var data = {};
        try {
          data = await res.json();
        } catch (_parseErr) {
          data = {};
        }
        typing.remove();

        if (!res.ok) {
          addMsg(
            messages,
            "bot error",
            (data && data.error) || "Sorry, something went wrong. Try again."
          );
        } else {
          if (data.session_id) {
            sessionId = data.session_id;
            localStorage.setItem(config.storageKey, sessionId);
          }
          addMsg(messages, "bot", data.answer || "(empty answer)");
        }
      } catch (_e) {
        typing.remove();
        addMsg(
          messages,
          "bot error",
          "Can't reach the server right now. Please try again later."
        );
      }

      setLoading(false);
      input.focus();
    }

    send.addEventListener("click", sendMessage);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    clearBtn.addEventListener("click", function () {
      sessionId = genId();
      localStorage.setItem(config.storageKey, sessionId);
      showWelcome();
      input.focus();
    });
  }

  function boot() {
    var script = currentScript();
    var config = readConfig(script);

    function go() {
      mount(config);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", go);
    } else {
      go();
    }

    window.TourRAGWidget = {
      open: function () {
        var box = document.getElementById("tourrag-box");
        if (box) box.classList.add("open");
      },
      close: function () {
        var box = document.getElementById("tourrag-box");
        if (box) box.classList.remove("open");
      },
      reinit: function (overrides) {
        var oldBtn = document.getElementById("tourrag-btn");
        var oldBox = document.getElementById("tourrag-box");
        var oldStyle = document.getElementById("tour-rag-widget-styles");
        if (oldBtn) oldBtn.remove();
        if (oldBox) oldBox.remove();
        if (oldStyle) oldStyle.remove();
        window.__TOUR_RAG_WIDGET_LOADED__ = true;
        var next = Object.assign(readConfig(currentScript()), overrides || {});
        mount(next);
      },
    };
  }

  boot();
})();
