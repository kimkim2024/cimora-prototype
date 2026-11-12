import { useEffect, useState } from 'react';

/**
 * A small review console for hopping around the build: it reads the hash route
 * directly (so it needs no router context), shows the viewport and the active
 * container breakpoint, and links straight to the studio's projects page.
 */

const LINKS = [
  { label: '首页', to: '#/' },
  { label: '产品', to: '#/product' },
  { label: '项目页（工作室）', to: '#/app', strong: true },
  { label: '展示', to: '#/showcase' },
  { label: '模板', to: '#/templates' },
  { label: '指南', to: '#/resources' },
  { label: '价格', to: '#/pricing' },
  { label: '工具', to: '#/tools' },
  { label: '帮助', to: '#/help' },
];

const CONTAINERS: Record<string, number> = { base: 1200, wide: 1360, ultra: 1560, mega: 1720 };
const LEGACY = import.meta.env.VITE_LEGACY_URL || 'http://127.0.0.1:4173';

export function DevConsole() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem('cimora.devconsole') === '1';
    } catch {
      return false;
    }
  });
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/');
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('hashchange', onHash);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cimora.devconsole', open ? '1' : '0');
    } catch {
      /* private mode */
    }
  }, [open]);

  const breakpoint =
    viewport.w >= 2200 ? 'mega' : viewport.w >= 1760 ? 'ultra' : viewport.w >= 1440 ? 'wide' : 'base';
  const route = hash.replace(/^#/, '') || '/';

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-5 z-[70] flex h-10 items-center gap-2 rounded-full border border-hairline bg-paper/95 px-3 type-label font-medium text-ink-muted shadow-card backdrop-blur transition-colors hover:border-hairline-strong hover:text-ink"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-ink-quiet" />
        调试台
      </button>
    );
  }

  return (
    <aside className="fixed right-5 bottom-5 z-[70] w-[248px] overflow-hidden rounded-2xl border border-hairline bg-paper/95 shadow-card backdrop-blur">
      <header className="flex items-center justify-between border-b border-hairline px-3 py-2">
        <span className="type-label font-semibold tracking-[0.08em] text-ink uppercase">调试台</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="收起调试台"
          className="grid h-6 w-6 place-items-center rounded-full text-ink-quiet transition-colors hover:bg-paper-muted hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="space-y-2 border-b border-hairline px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="type-label text-ink-quiet">当前路由</span>
          <code className="type-label font-mono text-ink">{route}</code>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="type-label text-ink-quiet">视口</span>
          <span className="type-label font-mono text-ink">
            {viewport.w} × {viewport.h}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="type-label text-ink-quiet">断点 / 内容宽</span>
          <span className="type-label font-mono text-ink">
            {breakpoint} · {CONTAINERS[breakpoint]}
          </span>
        </div>
      </div>

      <nav className="px-1.5 py-1.5">
        {LINKS.map((link) => (
          <a
            key={link.to}
            href={link.to}
            className={
              'flex items-center justify-between rounded-lg px-2 py-1 type-meta transition-colors ' +
              (link.strong ? 'font-medium text-ink hover:bg-paper-muted' : 'text-ink-muted hover:bg-paper-muted hover:text-ink')
            }
          >
            {link.label}
            <span className="type-micro text-ink-quiet">{link.to.replace('#', '')}</span>
          </a>
        ))}
      </nav>

      <footer className="border-t border-hairline px-3 py-2">
        <a
          href={LEGACY}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between type-meta text-ink-muted transition-colors hover:text-ink"
        >
          打开老原型
          <span className="type-micro text-ink-quiet">{LEGACY.replace(/^https?:\/\//, '')}</span>
        </a>
      </footer>
    </aside>
  );
}
