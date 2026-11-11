import { CAPABILITIES } from '../../data/home';

/** Five dark poster cards: the things the studio actually does. */
export function Capabilities() {
  return (
    <section aria-label="Creation capabilities" className="mx-auto w-full max-w-[1200px] px-10 pt-14">
      <div className="grid grid-cols-5 gap-4">
        {CAPABILITIES.map((item) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-2xl bg-ink text-ink-inverse transition-transform duration-300 hover:-translate-y-1"
          >
            <img
              src={item.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(15,15,15,.95)_0%,rgba(15,15,15,.72)_34%,rgba(15,15,15,.28)_58%,transparent_78%)]" />
            <div className="absolute inset-x-4 bottom-4">
              <h3 className="text-[14px] font-medium leading-[1.35]">{item.title}</h3>
              <p className="mt-1 text-[11px] leading-[1.5] text-ink-inverse/70">{item.line}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
