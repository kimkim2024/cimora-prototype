import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { legacyUrl } from '../lib/legacy';
import { useTitle } from '../lib/useTitle';

const NAV = [
  { to: '/app', label: 'Creation space', icon: 'space', end: true },
  { to: '/app/projects', label: 'My projects', icon: 'folder' },
  { to: '/app/assets', label: 'Asset library', icon: 'assets' },
  { to: '/app/tasks', label: 'Tasks & budget', icon: 'tasks' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
];

const ICONS: Record<string, string> = {
  space: 'M4 5h16M4 12h10M4 19h7',
  folder: 'M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  assets: 'M4 6h6v6H4zM14 6h6v6h-6zM4 16h6v4H4zM14 16h6v4h-6z',
  tasks: 'M4 7h10M4 12h10M4 17h7M18 6v4M18 14v4',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM4 12h2M18 12h2M12 4v2M12 18v2',
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

/**
 * Studio shell: fixed sidebar, content on the right. The studio itself is
 * being rebuilt page by page, so the sidebar routes exist even where the page
 * is still in the prototype.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  useTitle(pathname === '/app/projects' ? 'My projects · Cimora Studio' : 'Cimora Studio');

  return (
    <div className="flex min-h-dvh bg-canvas font-sans text-ink">
      <aside className="fixed inset-y-0 left-0 flex w-[248px] flex-col border-r border-hairline bg-paper px-4 py-6">
        <div className="px-2">
          <a href={legacyUrl('/')} className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Studio Cimora
          </a>
          <p className="mt-1 text-[11px] text-ink-quiet">Personal studio · Creator</p>
        </div>

        <nav aria-label="Studio" className="mt-8 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ' +
                (isActive ? 'bg-paper-muted font-medium text-ink' : 'text-ink-muted hover:bg-paper-muted hover:text-ink')
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-hairline bg-paper p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-ink-muted">Creator plan</span>
            <span className="text-[11px] tabular-nums text-ink-quiet">128 / 300</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-sunken">
            <div className="h-full w-[42%] rounded-full bg-accent" />
          </div>
          <p className="mt-2 text-[10px] text-ink-quiet">Generation credits this month</p>
        </div>

        <a href={legacyUrl('/')} className="mt-3 px-2 text-[11px] text-ink-quiet transition-colors hover:text-ink">
          Back to the site
        </a>
      </aside>

      <div className="ml-[248px] flex min-h-dvh w-full flex-col">
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-10 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
