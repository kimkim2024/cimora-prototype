import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type HeroMockupProps = {
  tagline: string;
  title: string;
  /** second headline line, set in a quieter ink */
  titleTail?: string;
  description: string;
  ctaText: string;
  ctaTo: string;
};

/* ---- the little glyphs inside the mockup ---------------------------------- */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden {...stroke}>
      <path d={dir === 'left' ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6'} />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden {...stroke}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#f5b301]" aria-hidden {...stroke}>
      <path d="M12 4l2.4 5 5.6.7-4 3.9 1 5.4L12 16.4 7 19l1-5.4-4-3.9 5.6-.7z" />
    </svg>
  );
}

function BatteryGlyph() {
  return (
    <svg viewBox="0 0 26 14" className="h-2.5 w-5" aria-hidden>
      <rect x="1" y="2" width="20" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="4" width="15" height="6" rx="1.6" fill="#22c55e" />
      <rect x="22.5" y="5" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

/** one coloured quick-action tile: white glyph on a saturated square, tiny label */
function QuickAction({ color, label, children }: { color: string; label: string; children: ReactNode }) {
  return (
    <div className="flex w-11 flex-col items-center gap-1.5">
      <span
        className="grid h-9 w-9 place-items-center rounded-[10px] text-white shadow-[0_2px_6px_rgba(23,23,23,0.16)]"
        style={{ backgroundColor: color }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden {...stroke}>
          {children}
        </svg>
      </span>
      <span className="text-[8px] leading-none text-[#a1a1aa]">{label}</span>
    </div>
  );
}

/**
 * The product hero: the promise, then the workspace itself.
 *
 * The visual is a layered device mockup built from markup (not a screenshot), so
 * it stays sharp at any width: two pastel sheets peeking out behind a browser
 * window that holds the workspace header, the quick actions and a marker
 * underline, with a phone resting over its bottom corner.
 */
export function HeroMockup({ tagline, title, titleTail, description, ctaText, ctaTo }: HeroMockupProps) {
  return (
    <section className="relative isolate overflow-hidden pt-14 pb-24 wide:pt-20 mega:pt-24">
      <div className="container-page flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper/70 px-4 py-1.5 text-[12px] font-medium text-ink backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-deep" />
          </span>
          {tagline}
        </span>

        <h1 className="mt-7 max-w-[760px] font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.038em] text-ink wide:max-w-[900px] wide:text-[60px] mega:text-[68px]">
          {title}
          {titleTail ? (
            <>
              <br />
              <span className="text-ink/45">{titleTail}</span>
            </>
          ) : null}
        </h1>

        <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.7] text-ink-muted">{description}</p>

        <Link
          to={ctaTo}
          className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-ink px-9 text-[15px] font-medium text-ink-inverse transition-transform duration-300 hover:scale-[1.04] hover:bg-ink-hover active:scale-[0.97]"
        >
          {ctaText}
        </Link>
      </div>

      {/* ------------------------------------------------ the device mockup */}
      {/* the sheets and the phone are positioned against the window, so the
          composition holds together at every width */}
      <div className="mx-auto mt-16 w-full max-w-[660px] px-10 pb-14 wide:mt-20 wide:max-w-[760px] mega:max-w-[860px]">
        <div className="relative" aria-hidden="true">
          <div className="absolute -inset-x-3 -top-3 bottom-4 -rotate-[6deg] rounded-[22px] bg-[#cbbcfa]" />
          <div className="absolute -inset-x-1.5 -top-1.5 bottom-2 -rotate-[2.5deg] rounded-[20px] bg-[#f8cba6]" />

          {/* browser window */}
          <div className="relative overflow-hidden rounded-[18px] border border-[#ececec] bg-paper shadow-[0_30px_70px_-30px_rgba(23,23,23,0.45)]">
            <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
              <span className="ml-1.5 flex items-center gap-1.5 text-ink-quiet">
                <Chevron dir="left" />
                <Chevron dir="right" />
              </span>
              <div className="flex flex-1 items-center gap-2 rounded-full border border-[#e6e6e6] bg-[#fafafa] px-3 py-1.5 text-[11px] text-ink-quiet">
                <SearchGlyph />
                Search
              </div>
              <StarGlyph />
            </div>

            <div className="px-6 pt-5 pb-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-ink text-[15px] font-semibold text-ink-inverse">
                  C
                </span>
                <span className="font-display text-[15px] font-semibold text-ink">Cimora</span>
              </div>

              <p className="mt-5 text-[12px] text-ink-muted">Quick actions</p>
              {/* the hand-drawn marker underline */}
              <div className="mt-1.5 h-[3px] w-[52%] -rotate-[0.35deg] rounded-full bg-ink" />

              <div className="mt-5 flex gap-3">
                <QuickAction color="#3b82f6" label="Story">
                  <path d="M5 5h9a3 3 0 013 3v11H8a3 3 0 01-3-3z" />
                  <path d="M5 16a3 3 0 013-3h9" />
                </QuickAction>
                <QuickAction color="#22c55e" label="Panels">
                  <rect x="4" y="5" width="7" height="6" rx="1.5" />
                  <rect x="13" y="5" width="7" height="6" rx="1.5" />
                  <rect x="4" y="13" width="16" height="6" rx="1.5" />
                </QuickAction>
                <QuickAction color="#a855f7" label="Motion">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M10.5 9l5 3-5 3z" />
                </QuickAction>
                <QuickAction color="#f97316" label="Assets">
                  <path d="M4 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                </QuickAction>
                <QuickAction color="#ef4444" label="Delivery">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </QuickAction>
              </div>
            </div>
          </div>

          {/* phone resting over the bottom-right corner */}
          <div className="absolute -right-8 -bottom-12 w-[32%] rotate-[6deg] rounded-[26px] border-[5px] border-[#101828] bg-paper shadow-[0_24px_50px_-20px_rgba(23,23,23,0.5)]">
            <div className="overflow-hidden rounded-[21px] bg-paper">
              <div className="flex items-center justify-between px-3 pt-2 text-[9px] font-semibold text-ink">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <BatteryGlyph />
                  <span className="text-[8px] font-medium text-ink-muted">100%</span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="h-6 w-6 rounded-full bg-ink" />
                <span className="text-[11px] font-semibold text-ink">Cimora</span>
              </div>
              <div className="grid grid-cols-3 gap-2 px-3 pb-8 [mask-image:linear-gradient(to_bottom,#000_50%,transparent)]">
                {Array.from({ length: 15 }, (_, i) => (
                  <span key={i} className="h-6 rounded-[6px] bg-[#f1f1f3]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
