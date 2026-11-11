import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Create',
    links: [
      { label: 'Webtoon creation', to: '/features/webtoon' },
      { label: 'Motion comic', to: '/features/motion-comic' },
      { label: 'Tools hub', to: '/tools' },
      { label: 'Studio', to: '/app' },
    ],
  },
  {
    title: 'Inspiration & support',
    links: [
      { label: 'Showcase', to: '/showcase' },
      { label: 'Guides', to: '/resources' },
      { label: 'Help center', to: '/help' },
      { label: 'Changelog', to: '/resources/updates' },
    ],
  },
  {
    title: 'About usage',
    links: [
      { label: 'Pricing & usage', to: '/pricing' },
      { label: 'Privacy & data', to: '/legal/privacy' },
      { label: 'Commercial use & copyright', to: '/legal/copyright' },
      { label: 'Terms of service', to: '/legal/terms' },
    ],
  },
];

/** Shared public footer. One component, every page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="container-page grid grid-cols-[1.6fr_repeat(3,1fr)] gap-10 pb-8 pt-14">
        <div>
          <Link to="/" className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
            Studio Cimora
          </Link>
          <p className="mt-4 max-w-[30ch] text-[13px] leading-[1.7] text-ink-muted">
            Let your story grow between every frame. Consistent characters, editable creation, clear steps.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-[12px] font-medium text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[12px] text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
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
