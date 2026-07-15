import { siteConfig } from "@/config/site";

export function JsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    founder: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.github,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.author.phone,
        contactType: "sales",
        areaServed: ["TZ", "KE", "UG", "RW", "ET", "Worldwide"],
        availableLanguage: ["English", "Swahili"],
      },
    ],
    sameAs: [siteConfig.author.github, siteConfig.social.github],
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "MVP demo API for tourism chatbot integration",
    },
    featureList: [
      "Multi-tenant RAG chat API",
      "Safari and trek knowledge bases",
      "Simple API key authentication",
      "Website embed ready",
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Tour RAG API?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A multi-tenant RAG chatbot API for East African safari and trek operators. Each company gets its own API key, system prompt, and knowledge base.",
        },
      },
      {
        "@type": "Question",
        name: "How do I add a tourism chatbot to my website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Create a tenant, ingest tour packages and FAQs via the ingest API, then call POST /api/v1/chat with your tenant API key from your website or widget.",
        },
      },
      {
        "@type": "Question",
        name: "Who is this for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Safari companies, Kilimanjaro operators, Zanzibar hotels, DMCs, and travel startups that need an always-on assistant for routes, prices, and FAQs.",
        },
      },
      {
        "@type": "Question",
        name: "How do I contact the developer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Contact ${siteConfig.author.name} by phone ${siteConfig.author.phone}, WhatsApp, or email ${siteConfig.author.email}.`,
        },
      },
    ],
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/docs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
    </>
  );
}
