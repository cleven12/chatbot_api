import Link from "next/link";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/docs", label: "API Docs" },
  { href: "/integrate", label: "Integrate" },
  { href: "/demo", label: "Demo" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden>
            ◆
          </span>
          <span className="brand-text">{siteConfig.shortName}</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <a
            className="nav-cta"
            href={siteConfig.author.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
