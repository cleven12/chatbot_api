import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <strong>{siteConfig.name}</strong>
          <p className="muted small">
            AI chatbot API for safari & trek operators across East Africa.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/docs">Documentation</Link>
          <Link href="/integrate">Website integration</Link>
          <Link href="/demo">Live demo</Link>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <div className="footer-contact">
          <a href={siteConfig.author.phoneHref}>{siteConfig.author.phone}</a>
          <a href={siteConfig.author.emailHref}>{siteConfig.author.email}</a>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{siteConfig.author.githubUser}
          </a>
        </div>
      </div>
      <p className="footer-copy muted small">
        © {year} {siteConfig.author.name}. Built for tour operators who want
        smart chat on their site without heavy infrastructure.
      </p>
    </footer>
  );
}
