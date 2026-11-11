import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/product' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Templates', to: '/templates' },
      { label: 'Changelog', to: '/resources/updates' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', to: '/resources' },
      { label: 'Guides', to: '/resources' },
      { label: 'Community', to: '/showcase' },
      { label: 'Tools', to: '/tools' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'Showcase', to: '/showcase' },
      { label: 'Comic creation', to: '/features/webtoon' },
      { label: 'Video creation', to: '/features/motion-comic' },
      { label: 'Start creating', to: '/app' },
    ],
  },
];

/** The home footer: brand, subscribe, three columns, and the dotted band. */
export function HomeFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-paper" aria-label="Cimora footer">
      <div className="container-page grid grid-cols-[1.5fr_repeat(3,1fr)] gap-10 pt-14">
        <div>
          <Link to="/" className="type-lead font-semibold tracking-[-0.02em] text-ink">
            Cimora
          </Link>
          <p className="mt-3 max-w-[34ch] type-list leading-[1.7] text-ink-muted">
            Turn the worlds you love into your own work. Stories, characters, comics and motion in one studio.
          </p>

          <form className="mt-5 max-w-[320px]" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="footer-email" className="block type-meta text-ink">
              Get product updates by email
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="footer-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@studio.com"
                className="h-9 min-w-0 flex-1 rounded-lg border border-hairline bg-paper px-3 type-list text-ink outline-none placeholder:text-ink-quiet focus:border-hairline-strong"
              />
              <button
                type="submit"
                className="h-9 rounded-lg bg-ink px-3.5 type-list font-medium text-ink-inverse transition-opacity hover:opacity-85"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-2 type-label text-ink-quiet">Demo only — email subscriptions are not connected.</p>
          </form>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="type-list font-medium text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="type-list text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-page mt-12 flex items-center justify-between border-t border-hairline py-5 type-meta text-ink-quiet">
        <div className="flex items-center gap-4">
          <span>© 2026 Cimora.</span>
          <Link to="/legal/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <Link to="/legal/terms" className="transition-colors hover:text-ink">
            Terms
          </Link>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="type-meta text-ink-quiet transition-colors hover:text-ink"
        >
          Back to top
        </button>
      </div>

      {/* the dotted band the prototype closes the home page with: the dots light
          up around the pointer, and stay dim the rest of the time */}
      <div
        aria-hidden
        className="group relative h-[168px] overflow-hidden border-t border-hairline bg-paper-muted"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--df-x', `${event.clientX - box.left}px`);
          event.currentTarget.style.setProperty('--df-y', `${event.clientY - box.top}px`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--df-x', '-999px');
          event.currentTarget.style.setProperty('--df-y', '-999px');
        }}
        style={{
          backgroundImage: 'radial-gradient(var(--color-hairline-strong) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            backgroundImage: 'radial-gradient(var(--color-ink) 1.4px, transparent 1.4px)',
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(circle 170px at var(--df-x, -999px) var(--df-y, -999px), #000 0%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(circle 170px at var(--df-x, -999px) var(--df-y, -999px), #000 0%, transparent 72%)',
          }}
        />
        <span className="absolute inset-0 grid place-items-center type-copy font-medium tracking-[0.4em] text-ink-quiet">
          CIMORA STUDIO
        </span>
      </div>
    </footer>
  );
}
