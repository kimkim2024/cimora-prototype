import { NavLink, Outlet } from 'react-router-dom';
import { legacyUrl } from '../lib/legacy';
import { useStudio } from '../lib/studioStore';
import { useTitle } from '../lib/useTitle';

type Item = { to: string; label: string; icon: string; end?: boolean; external?: boolean };

const WORKSPACE: Item[] = [
  { to: '/app', label: 'Creation Space', icon: 'home', end: true, external: true },
  { to: '/app/projects', label: 'My Projects', icon: 'folder' },
  { to: '/app/assets', label: 'Asset Library', icon: 'assets', external: true },
  { to: '/app/tasks', label: 'Tasks & Orchestration', icon: 'tasks', external: true },
  { to: '/app/tools', label: 'Creative Tools', icon: 'tools', external: true },
  { to: '/app/exports', label: 'Export & Delivery', icon: 'export', external: true },
];

const DISCOVER: Item[] = [
  { to: '/app/community', label: 'Showcase', icon: 'showcase' },
  { to: '/app/market', label: 'Market', icon: 'market' },
  { to: '/app/creator', label: 'Creator Centre', icon: 'creator' },
];

const ICONS: Record<string, string> = {
  home: 'M4 11.5L12 5l8 6.5V19a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z',
  folder: 'M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  assets: 'M4 6h6v6H4zM14 6h6v6h-6zM4 16h6v4H4zM14 16h6v4h-6z',
  tasks: 'M4 7h10M4 12h10M4 17h7M18 6v4M18 14v4',
  tools: 'M14 6l4 4-8 8H6v-4zM15 5l4 4',
  export: 'M12 4v10M8 8l4-4 4 4M5 17h14',
  showcase: 'M4 6h16v10H4zM9 20h6',
  market: 'M6 8h12l-1 11H7zM9 8V6a3 3 0 016 0v2',
  creator: 'M4 20l4-1 9-9-3-3-9 9zM14 6l3 3',
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

function NavItem({ item }: { item: Item }) {
  const className = ({ isActive }: { isActive: boolean }) =>
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 type-copy transition-colors ' +
    (isActive ? 'bg-paper-muted font-medium text-ink' : 'text-ink-muted hover:bg-paper-muted hover:text-ink');

  if (item.external) {
    return (
      <a href={legacyUrl(item.to)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 type-copy text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink">
        <Icon name={item.icon} />
        {item.label}
      </a>
    );
  }

  return (
    <NavLink to={item.to} end={item.end} className={className}>
      <Icon name={item.icon} />
      {item.label}
    </NavLink>
  );
}

/**
 * Studio shell: fixed sidebar, content on the right.
 *
 * Showcase, Market, Creator centre and the wallet are React routes now; the
 * pages still owned by the prototype (dashboard, assets, tasks, tools, export)
 * link across to it instead of dead-ending on a placeholder.
 */
export function AppLayout() {
  const { wallet } = useStudio();
  useTitle('Cimora Studio');

  return (
    <div className="flex min-h-dvh bg-canvas font-sans text-ink">
      <aside className="fixed inset-y-0 left-0 flex w-[248px] flex-col border-r border-hairline bg-paper px-4 py-6">
        <div className="px-2">
          <a href={legacyUrl('/')} className="type-lead font-semibold tracking-[-0.02em] text-ink">
            Studio Cimora
          </a>
          <p className="mt-1 type-meta text-ink-quiet">Personal studio · Creator</p>
        </div>

        <nav aria-label="Studio" className="mt-6 flex-1 overflow-y-auto">
          <p className="px-2.5 pb-1 type-micro text-ink-quiet">Workspace</p>
          <div className="space-y-0.5">
            {WORKSPACE.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>

          <p className="mt-6 px-2.5 pb-1 type-micro text-ink-quiet">Discover</p>
          <div className="space-y-0.5">
            {DISCOVER.map((item) => (
              <NavItem key={item.label} item={{ ...item }} />
            ))}
          </div>
        </nav>

        <NavLink
          to="/app/wallet"
          className={({ isActive }) =>
            'mt-4 flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors ' +
            (isActive ? 'border-ink bg-paper-muted' : 'border-hairline hover:bg-paper-muted')
          }
        >
          <span className="type-meta text-ink-muted">Credits</span>
          <span className="flex items-center gap-1.5 type-copy tabular-nums text-ink">
            <span className="text-accent-deep">✦</span>
            {wallet}
          </span>
        </NavLink>

        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-sunken type-micro text-ink-muted">SC</span>
            <div>
              <p className="type-meta font-medium leading-tight text-ink">Story Creator</p>
              <p className="type-micro text-ink-quiet">Free plan</p>
            </div>
          </div>
          <a href={legacyUrl('/app/settings')} className="type-micro text-ink-quiet transition-colors hover:text-ink">
            Settings
          </a>
        </div>

        <a href={legacyUrl('/')} className="mt-3 px-2 type-meta text-ink-quiet transition-colors hover:text-ink">
          Back to the site
        </a>
      </aside>

      <div className="ml-[248px] flex min-h-dvh w-full flex-col">
        <main className="container-page flex-1 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
