import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live demo — tourism RAG chat",
  description:
    "Try the multi-tenant safari and trek chatbot demo. Paste a tenant API key and ask about packages, routes, and FAQs.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
