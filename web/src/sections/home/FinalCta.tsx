import { Link } from 'react-router-dom';
import { CTA_BANNER } from '../../data/home';

/** The closing poster: one image, one action, one line underneath. */
export function FinalCta() {
  return (
    <section className="container-page pt-24 text-center">
      <span className="type-label uppercase tracking-[0.18em] text-ink-quiet">Your next chapter starts here</span>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-hairline">
        <img src={CTA_BANNER} alt="" loading="lazy" decoding="async" className="w-full object-cover" />
        <div className="absolute inset-0 grid place-items-center">
          <Link
            to="/app"
            className="inline-flex h-12 items-center rounded-full bg-paper/90 px-7 type-body font-medium text-ink shadow-card backdrop-blur transition-transform hover:-translate-y-px hover:bg-paper"
          >
            Enter studio
          </Link>
        </div>
      </div>

      <p className="mt-5 type-list text-ink-muted">Co-write stories · unified assets · infinite canvas · motion</p>
    </section>
  );
}
