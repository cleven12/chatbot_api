/**
 * Public site + contact details — edit these for SEO and reachability.
 * Prefer env overrides on Vercel when you want to hide numbers from git.
 */
export const siteConfig = {
  name: "Tour RAG API",
  shortName: "TourRAG",
  tagline:
    "Multi-tenant RAG chatbot API for East African safari & trek operators",
  description:
    "Add an AI tourism assistant to your safari, Kilimanjaro, Serengeti, or Zanzibar website in minutes. Multi-tenant knowledge bases, API keys, and a simple chat API — built for East African tour operators and travel startups.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tourragapi.vercel.app",
  locale: "en_US",
  keywords: [
    "tourism chatbot API",
    "safari chatbot",
    "East Africa travel AI",
    "Kilimanjaro trek assistant",
    "Serengeti safari chatbot",
    "tour operator chatbot",
    "multi-tenant RAG API",
    "travel website AI integration",
    "Tanzania tourism API",
    "Kenya safari chatbot",
    "Zanzibar tour assistant",
    "RAG chatbot for websites",
    "Tour RAG API",
    "tourragapi",
  ],
  author: {
    name: ["Cleven","Yusra"],
    github: ["https://github.com/cleven12", "https://github.com/yusra1ally",],
    githubUser: ["cleven12","yusra1ally"],
    /** Update these so visitors can reach you */
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+255 754 225 781",
    phoneHref:
      process.env.NEXT_PUBLIC_CONTACT_PHONE_HREF || "tel:+255754225781",
    whatsapp:
      process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "https://wa.me/255754225781",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "clevengodsontech@gmail.com",
    emailHref:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL_HREF ||
      "mailto:clevengodsontech@gmail.com",
    location: "East Africa · Remote-friendly",
  },
  social: {
    github: "https://github.com/cleven12/chatbot_api",
  },
  apiBasePath: "/api/v1",
} as const;

export type SiteConfig = typeof siteConfig;
