import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type HeroMockupProps = {
  title: string;
  /** second headline line */
  titleTail?: string;
  description: string;
  ctaText: string;
  ctaTo: string;
};

/*
 * Everything inside the mockup is sized in `cqw` - percent of the art box's own
 * width - so the whole browser window scales as one piece and never turns into
 * a stretched, flat rectangle on a wide screen. The art box is the container
 * (`container-type: inline-size`) and is capped at 640px, which keeps the
 * window near the reference's 1.7:1 proportions at every viewport.
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[2.2cqw] w-[2.2cqw]" aria-hidden {...stroke}>
      <path d={dir === 'left' ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6'} />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.9cqw] w-[1.9cqw]" aria-hidden {...stroke}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[2.6cqw] w-[2.6cqw] text-[#f5b301]" aria-hidden {...stroke}>
      <path d="M12 4l2.4 5 5.6.7-4 3.9 1 5.4L12 16.4 7 19l1-5.4-4-3.9 5.6-.7z" />
    </svg>
  );
}

function BatteryGlyph() {
  return (
    <svg viewBox="0 0 26 14" className="h-[1.6cqw] w-[3.2cqw]" aria-hidden>
      <rect x="1" y="2" width="20" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="4" width="15" height="6" rx="1.6" fill="#22c55e" />
      <rect x="22.5" y="5" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

/** one coloured quick-action tile: white glyph on a saturated square, tiny label */
function QuickAction({ color, label, children }: { color: string; label: string; children: ReactNode }) {
  return (
    <div className="flex w-[7cqw] flex-col items-center gap-[1.1cqw]">
      <span
        className="grid h-[6.6cqw] w-[6.6cqw] place-items-center rounded-[1.8cqw] text-white shadow-[0_1px_3px_rgba(23,23,23,0.18)]"
        style={{ backgroundColor: color }}
      >
        <svg viewBox="0 0 24 24" className="h-[3cqw] w-[3cqw]" aria-hidden {...stroke}>
          {children}
        </svg>
      </span>
      <span className="text-[1.5cqw] leading-none text-[#a1a1aa]">{label}</span>
    </div>
  );
}

/**
 * The product hero: the promise on the left, the workspace itself on the right.
 * The visual is a layered device mockup built from markup (not a screenshot), so
 * it stays sharp at any width.
 */
export function HeroMockup({ title, titleTail, description, ctaText, ctaTo }: HeroMockupProps) {
  return (
    <section className="relative isolate overflow-hidden pt-14 pb-16 wide:pt-16 wide:pb-24">
      <div className="grid items-center gap-12 pl-[max(40px,calc((100vw-1200px)/2+40px))] wide:grid-cols-[minmax(0,600px)_minmax(0,1fr)] wide:pl-[max(56px,calc((100vw-1360px)/2+56px))] ultra:pl-[max(64px,calc((100vw-1560px)/2+64px))] mega:pl-[max(72px,calc((100vw-1720px)/2+72px))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="min-w-0">
          <h1 className="max-w-none font-display text-[42px] font-semibold leading-[1.03] tracking-[-0.038em] text-ink wide:text-[54px] mega:text-[62px]">
            {title}
            {titleTail ? (
              <>
                <br />
                <span>{titleTail}</span>
              </>
            ) : null}
          </h1>

          <p className="mt-6 max-w-[46ch] type-lead leading-[1.7] text-ink-muted">{description}</p>

          <Link
            to={ctaTo}
            className="mt-9 inline-flex h-14 items-center justify-center rounded-full bg-ink px-9 type-lead font-medium text-ink-inverse transition-transform duration-300 hover:scale-[1.04] hover:bg-ink-hover active:scale-[0.97]"
          >
            {ctaText}
          </Link>
        </div>

        {/* the mockup column reaches past the container so the phone is clipped
            by the viewport edge instead of ending on a margin */}
        <div className="relative min-w-0 pr-4 wide:pr-5">
          <div
            className="relative ml-auto w-full max-w-[800px] [container-type:inline-size]"
            aria-hidden="true"
          >
            <div className="absolute -inset-x-[0.6cqw] -top-[0.6cqw] bottom-[2.4cqw] -rotate-[6deg] rounded-[3.6cqw] bg-[#cbbcfa]" />
            <div className="absolute -inset-x-[0.3cqw] -top-[0.3cqw] bottom-[1.2cqw] -rotate-[2.5deg] rounded-[3.4cqw] bg-[#f8cba6]" />

            {/* browser window */}
            <div className="relative overflow-hidden rounded-[3cqw] border border-[#ececec] bg-paper shadow-[0_4cqw_10cqw_-4cqw_rgba(23,23,23,0.45)]">
              <div className="flex items-center gap-[1.6cqw] border-b border-[#f0f0f0] px-[2.8cqw] py-[2.4cqw]">
                <span className="h-[1.6cqw] w-[1.6cqw] rounded-full bg-[#ef4444]" />
                <span className="h-[1.6cqw] w-[1.6cqw] rounded-full bg-[#facc15]" />
                <span className="h-[1.6cqw] w-[1.6cqw] rounded-full bg-[#22c55e]" />
                <span className="ml-[1cqw] flex items-center gap-[1cqw] text-ink-quiet">
                  <Chevron dir="left" />
                  <Chevron dir="right" />
                </span>
                <div className="flex flex-1 items-center gap-[1.2cqw] rounded-full border border-[#e6e6e6] bg-[#fafafa] px-[2cqw] py-[1.1cqw] text-[1.9cqw] text-ink-quiet">
                  <SearchGlyph />
                  Search
                </div>
                <StarGlyph />
              </div>

              <div className="px-[4cqw] pt-[4.2cqw] pb-[4.6cqw]">
                <div className="flex items-center gap-[1.8cqw]">
                  <span className="grid h-[6.4cqw] w-[6.4cqw] place-items-center rounded-[1.8cqw] bg-ink text-[2.6cqw] font-semibold text-ink-inverse">
                    C
                  </span>
                  <span className="font-display text-[2.6cqw] font-semibold text-ink">Cimora</span>
                </div>

                <p className="mt-[4.2cqw] text-[2.1cqw] text-ink-muted">Quick actions</p>
                {/* the hand-drawn marker underline */}
                <div className="mt-[1cqw] h-[0.5cqw] w-[52%] -rotate-[0.35deg] rounded-full bg-ink" />

                <div className="mt-[3.6cqw] flex gap-[2.2cqw]">
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

                {/* the chapter strip that gives the window its height */}
                <div className="mt-[4cqw] flex items-center gap-[1.6cqw] rounded-[1.8cqw] border border-[#ececec] bg-[#fbfbfb] px-[2.4cqw] py-[2cqw]">
                  <span className="text-[1.8cqw] font-medium text-ink">Chapter 01</span>
                  <span className="text-[1.6cqw] text-ink-quiet">12 panels</span>
                  <span className="relative ml-auto h-[0.9cqw] w-[34%] overflow-hidden rounded-full bg-[#ececec]">
                    <span className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-ink" />
                  </span>
                </div>
              </div>
            </div>

            {/* phone resting over the bottom-right corner */}
            <div className="absolute -right-[5cqw] -bottom-[3cqw] w-[34%] rotate-[6deg] rounded-[4.4cqw] border-[0.9cqw] border-[#101828] bg-paper shadow-[0_4cqw_8cqw_-3cqw_rgba(23,23,23,0.5)]">
              <div className="overflow-hidden rounded-[3.6cqw] bg-paper">
                <div className="flex items-center justify-between px-[2cqw] pt-[1.4cqw] text-[1.6cqw] font-semibold text-ink">
                  <span>9:41</span>
                  <span className="flex items-center gap-[0.8cqw]">
                    <BatteryGlyph />
                    <span className="text-[1.4cqw] font-medium text-ink-muted">100%</span>
                  </span>
                </div>
                <div className="flex items-center gap-[1.4cqw] px-[2cqw] py-[1.8cqw]">
                  <span className="h-[4.4cqw] w-[4.4cqw] rounded-full bg-ink" />
                  <span className="text-[2cqw] font-semibold text-ink">Cimora</span>
                </div>
                <div className="grid grid-cols-3 gap-[1.4cqw] px-[2cqw] pb-[5cqw] [mask-image:linear-gradient(to_bottom,#000_50%,transparent)]">
                  {Array.from({ length: 15 }, (_, i) => (
                    <span key={i} className="h-[4.4cqw] rounded-[1cqw] bg-[#f1f1f3]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
