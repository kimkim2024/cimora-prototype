import { Link, NavLink } from 'react-router-dom';
import { legacyUrl } from '../lib/legacy';

const LINKS = [
  { label: 'Product', to: '/product' },
  { label: 'Tools', to: '/tools' },
  { label: 'Showcase', to: '/showcase' },
  { label: 'Templates', to: '/templates' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Guides', to: '/resources' },
];

/** The shared public bar: flat links and one primary action, as on the site. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between gap-8 px-10">
        <Link to="/" className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Studio Cimora
        </Link>

        <nav aria-label="Website navigation" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                'rounded-md px-3 py-1.5 text-[14px] leading-5 transition-colors ' +
                (isActive ? 'bg-paper-muted text-ink' : 'text-ink-muted hover:bg-paper-muted hover:text-ink')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <a
          href={legacyUrl('/auth')}
          className="inline-flex h-9 items-center rounded-full bg-ink px-5 text-[14px] font-medium text-ink-inverse transition-opacity hover:opacity-85"
        >
          Get started
        </a>
      </div>
    </header>
  );
}
