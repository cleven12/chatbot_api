"use client";

import { useEffect } from "react";

export type TourRagWidgetOptions = {
  apiKey: string;
  title?: string;
  subtitle?: string;
  welcome?: string;
  primary?: string;
  apiBase?: string;
  avatar?: string;
};

/**
 * Loads the floating chat bubble (public/tour-rag-widget.js).
 * Re-inits when apiKey changes.
 */
export function TourRagWidgetLoader({
  apiKey,
  title = "Safari Assistant",
  subtitle = "Live demo · Tour RAG",
  welcome = "Hi! Ask about safaris, treks, packages, or prices.",
  primary = "#0d8f5b",
  apiBase = "/api/v1",
  avatar = "T",
}: TourRagWidgetOptions) {
  useEffect(() => {
    if (!apiKey.trim()) return;

    const w = window as Window & {
      TourRAGConfig?: TourRagWidgetOptions;
      TourRAGWidget?: { reinit: (o: TourRagWidgetOptions) => void };
      __TOUR_RAG_WIDGET_LOADED__?: boolean;
    };

    const apply = () => {
      const opts: TourRagWidgetOptions = {
        apiKey: apiKey.trim(),
        title,
        subtitle,
        welcome,
        primary,
        apiBase,
        avatar,
      };
      w.TourRAGConfig = opts;
      if (w.TourRAGWidget?.reinit) {
        w.TourRAGWidget.reinit(opts);
      }
    };

    const existing = document.querySelector(
      'script[data-tour-rag-widget="1"]'
    ) as HTMLScriptElement | null;

    if (existing && w.__TOUR_RAG_WIDGET_LOADED__) {
      apply();
      return;
    }

    const script = document.createElement("script");
    script.src = "/tour-rag-widget.js";
    script.defer = true;
    script.dataset.tourRagWidget = "1";
    script.dataset.apiKey = apiKey.trim();
    script.dataset.title = title;
    script.dataset.subtitle = subtitle;
    script.dataset.welcome = welcome;
    script.dataset.primary = primary;
    script.dataset.apiBase = apiBase;
    script.dataset.avatar = avatar;
    script.onload = () => apply();
    document.body.appendChild(script);

    return () => {
      // keep script for SPA navigations; bubble stays until full reload
    };
  }, [apiKey, title, subtitle, welcome, primary, apiBase, avatar]);

  return null;
}
