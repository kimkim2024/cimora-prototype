import { Link } from 'react-router-dom';

export type MarqueeShot = { src: string; alt: string; label?: string };

type HeroMarqueeProps = {
  tagline: string;
  /** first headline line, split into words that rise in one after another */
  title: string;
  /** second headline line, set in a quieter ink */
  titleTail?: string;
  description: string;
  ctaText: string;
  ctaTo: string;
  shots: MarqueeShot[];
  className?: string;
};

/** A headline line split into words, each with its own entrance delay. */
function Words({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <span key={`${word}-${index}`} className="hero-word" style={{ animationDelay: `${(offset + index) * 55}ms` }}>
          {word}
        </span>
      ))}
    </>
  );
}

/**
 * The product hero: one promise, one action, and the work itself moving
 * underneath. Adapted from the marquee hero pattern (tagline pill, staggered
 * headline, full-bleed image strip) with Cimora's type, colour and motion
 * tokens - the strip is a CSS keyframe loop, so it needs no animation library.
 */
export function HeroMarquee({
  tagline,
  title,
  titleTail,
  description,
  ctaText,
  ctaTo,
  shots,
  className = '',
}: HeroMarqueeProps) {
  // The strip has to be wider than the viewport before the -50% loop can be
  // seamless, so repeat the set until one half clears the widest content width
  // we support (1720px), then duplicate that half so the seam lands off screen.
  const repeats = Math.max(4, Math.ceil(12 / Math.max(1, shots.length)));
  const half = Array.from({ length: repeats }, () => shots).flat();
  const track = [...half, ...half];

  return (
    <section className={`relative isolate flex flex-col overflow-hidden min-h-[max(620px,calc(100svh-88px))] ${className}`}>
      <div className="container-page flex flex-1 flex-col items-center justify-center pt-14 pb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper/70 px-4 py-1.5 text-[12px] font-medium text-ink backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-deep" />
          </span>
          {tagline}
        </span>

        <h1 className="mt-8 max-w-[760px] font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.038em] text-ink wide:max-w-[920px] wide:text-[64px] mega:max-w-[1010px] mega:text-[74px]">
          <span className="block">
            <Words text={title} />
          </span>
          {titleTail ? (
            <span className="block text-ink/45">
              <Words text={titleTail} offset={title.split(' ').length} />
            </span>
          ) : null}
        </h1>

        <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.7] text-ink-muted">{description}</p>
        <Link
          to={ctaTo}
          className="mt-9 inline-flex h-14 items-center justify-center rounded-full bg-ink px-9 text-[15px] font-medium text-ink-inverse transition-transform duration-300 hover:scale-[1.04] hover:bg-ink-hover active:scale-[0.97]"
        >
          {ctaText}
        </Link>
      </div>

      {/* the strip sits on the fold, fading out at its own top and bottom edge */}
      <div className="hero-marquee h-[clamp(190px,26svh,300px)]">
        <div className="hero-marquee-track flex h-full w-max items-center gap-5">
          {track.map((shot, index) => (
            <figure
              key={`${shot.src}-${index}`}
              className="relative h-[88%] shrink-0 overflow-hidden rounded-2xl shadow-card"
              style={{ aspectRatio: '3 / 4', transform: `rotate(${index % 2 === 0 ? -2 : 5}deg)` }}
            >
              <img src={shot.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              {shot.label ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-ink/55 px-3 py-1.5 text-[10px] font-medium text-ink-inverse backdrop-blur-sm">
                  {shot.label}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
