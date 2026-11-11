import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DitherField } from '../components/ui/DitherField';

/**
 * The product hero: a big paper card with a dithered accent field behind it,
 * one serif headline, and a single action. Hovering the card stirs the field.
 */
export function ProductHero() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-10 pt-10">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative isolate overflow-hidden rounded-[48px] border border-hairline bg-paper"
      >
        <div className="pointer-events-none absolute inset-0 z-0 opacity-45 mix-blend-multiply">
          <DitherField speed={hovered ? 0.6 : 0.2} color="#9ccc0f" />
        </div>

        <div className="relative z-10 flex min-h-[560px] flex-col items-center justify-center px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper/70 px-4 py-1.5 text-[12px] font-medium text-ink backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-deep" />
            </span>
            Local demo · no signup
          </span>

          <h1 className="mt-8 max-w-[18ch] font-serif text-[68px] font-normal leading-[1.02] tracking-[-0.02em] text-ink">
            Stop scattering your story <br />
            <span className="text-ink/65">across different tools.</span>
          </h1>

          <p className="mt-7 max-w-[56ch] text-[15px] leading-[1.7] text-ink-muted">
            The comic is the source of truth for visuals and story; the video reuses the same characters, scenes and
            voice.
          </p>

          <Link
            to="/app"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-ink px-10 text-[15px] font-medium text-ink-inverse transition-all duration-300 hover:scale-[1.03] hover:bg-ink-hover active:scale-[0.97] hover:ring-4 hover:ring-ink/10"
          >
            Open demo workspace
          </Link>
        </div>
      </div>
    </section>
  );
}
