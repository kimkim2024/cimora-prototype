const LINKS = [
  { label: 'Product', href: '#/product' },
  { label: 'Tools', href: '#/tools' },
  { label: 'Showcase', href: '#/showcase' },
  { label: 'Templates', href: '#/templates' },
  { label: 'Pricing', href: '#/pricing' },
  { label: 'Guides', href: '#/resources' },
];

/** The shared public bar: flat links and one primary action, as on the site. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between gap-8 px-10">
        <a href="#/" className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Studio Cimora
        </a>
        <nav aria-label="Website navigation" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-[14px] leading-5 text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#/auth"
          className="inline-flex h-9 items-center rounded-full bg-ink px-5 text-[14px] font-medium text-ink-inverse transition-opacity hover:opacity-85"
        >
          Get started
        </a>
      </div>
    </header>
  );
}
