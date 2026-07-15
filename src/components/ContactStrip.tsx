import { siteConfig } from "@/config/site";

export function ContactStrip() {
  const { author } = siteConfig;
  return (
    <section className="contact-strip" id="contact" aria-labelledby="contact-title">
      <div className="contact-strip-inner">
        <div>
          <p className="eyebrow">Talk to the builder</p>
          <h2 id="contact-title">Need this on your tourism website?</h2>
          <p className="muted">
            Call or message {author.name} for demos, custom knowledge bases,
            multi-tenant setup, or embedding the chat widget on your operator
            site.
          </p>
        </div>
        <div className="contact-actions">
          <a className="btn btn-primary" href={author.phoneHref}>
            <PhoneIcon /> Call {author.phone}
          </a>
          <a
            className="btn btn-whatsapp"
            href={author.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          <a className="btn btn-ghost" href={author.emailHref}>
            <MailIcon /> Email
          </a>
          <a
            className="btn btn-ghost"
            href={author.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon /> GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 6.5A7.7 7.7 0 0 0 12 4.2 7.8 7.8 0 0 0 4.2 12c0 1.4.4 2.7 1 3.9L4 20l4.2-1.1A7.8 7.8 0 0 0 20 12a7.7 7.7 0 0 0-2.5-5.5zM12 18.3c-1.2 0-2.3-.3-3.3-.9l-.2-.1-2.5.7.7-2.4-.1-.2A6.2 6.2 0 1 1 18.3 12 6.2 6.2 0 0 1 12 18.3zm3.4-4.6c-.2-.1-1.1-.5-1.3-.6-.2-.1-.3-.1-.5.1s-.5.6-.7.7c-.1.1-.3.1-.5 0a5 5 0 0 1-1.5-.9 5.5 5.5 0 0 1-1-1.3c-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.4.6 1.9.6 2.6.5.4-.1 1.1-.5 1.3-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />
    </svg>
  );
}
