const COLUMNS = [
  {
    title: 'Create',
    links: [
      { label: 'Webtoon creation', href: '#/features/webtoon' },
      { label: 'Motion comic', href: '#/features/motion-comic' },
      { label: 'Tools hub', href: '#/tools' },
      { label: 'Studio', href: '#/app' },
    ],
  },
  {
    title: 'Inspiration & support',
    links: [
      { label: 'Showcase', href: '#/showcase' },
      { label: 'Guides', href: '#/resources' },
      { label: 'Help center', href: '#/help' },
      { label: 'Changelog', href: '#/resources/updates' },
    ],
  },
  {
    title: 'About usage',
    links: [
      { label: 'Pricing & usage', href: '#/pricing' },
      { label: 'Privacy & data', href: '#/legal/privacy' },
      { label: 'Commercial use & copyright', href: '#/legal/copyright' },
      { label: 'Terms of service', href: '#/legal/terms' },
    ],
  },
];

/** Shared public footer. One component, every page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1.6fr_repeat(3,1fr)] gap-10 px-10 pb-8 pt-14">
        <div>
          <a href="#/" className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
            Studio Cimora
          </a>
          <p className="mt-4 max-w-[30ch] text-[13px] leading-[1.7] text-ink-muted">
            Let your story grow between every frame. Consistent characters, editable creation, clear steps.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-[12px] font-medium text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[12px] text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-full mt-6 flex items-center justify-between border-t border-hairline pt-6 text-[11px] text-ink-quiet">
          <p>© 2026 Cimora · Full-site interactive prototype</p>
          <p>Local demo · generation, billing and publishing are simulated</p>
        </div>
      </div>
    </footer>
  );
}
