import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tourism RAG Chat",
  description:
    "Multi-tenant RAG chatbot for East African safari and trek operators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
